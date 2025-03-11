// deno-lint-ignore-file no-explicit-any
/**
 * This module provides an iterable and performant alternative to the native
 * `WeakMap` API, with an API surface that feels like a standard `Map`, but
 * behaves like a `WeakMap` in terms of memory management.
 *
 * @remarks
 * Under the hood, this runs on a `WeakMap` and a `Set` of `WeakRef`s. Relying
 * on the standard `WeakMap` API affords our implementation with all the same
 * performance characteristics, while the `Set<WeakRef<K>>` provides us with
 * the iterability we need to support the `Iterable` interface. The `WeakRef`
 * objects allow us to handle keys in a way that will not prevent them from
 * being garbage collected, which is crucial in the context of a `WeakMap`.
 *
 * When a key _is_ garbage collected, its associated `WeakRef` will return
 * `undefined` when it is dereferenced. We use a `FinalizationRegistry` to
 * automatically clean up these stale references, which removes them from the
 * `Set` to prevent memory leaks and ensure that the `size` property remains
 * accurate. The `FinalizationRegistry` is stored as a global singleton to
 * avoid the potential scenario where the registry winds up being gc'd itself
 * before all of its finalizers have had their chance to run.
 *
 * @example
 * ```ts
 * import { IterableWeakMap } from "@iter/weak-map";
 *
 * const map = new IterableWeakMap([
 *   [{ key: 1 }, 'value1'],
 *   [{ key: 2 }, 'value2']
 * ]);
 *
 * // keeping references to keys prevents garbage collection!
 * const keys = [...map.keys()]; // => [{ key: 1 }, { key: 2 }]
 *
 * const value1 = map.get(keys[0]); // => 'value1'
 *
 * // removing the key will allow it to be reclaimed
 * map.delete(keys[0]);
 * console.log(map.size); // => 1
 *
 * // clearing the map will allow all keys to be reclaimed
 * map.clear();
 * console.log(map.size); // => 0
 * ```
 *
 * @see https://jsr.io/@iter/weak-map/doc for the API documentation.
 * @see https://github.com/tc39/proposal-weakrefs#iterable-weak-maps
 * @author Nicholas Berlette <https://nick.mit-license.org>
 * @license MIT
 * @module iterable-weak-map
 */

// #region internal
/**
 * The internal representation of a key in an `IterableWeakMap`, associating
 * its value with a weak reference to the key.
 * @internal
 */
type WeakPayload<K extends WeakKey = WeakKey, V = any> = {
  k: WeakRef<K>;
  v: V;
};

/**
 * The internal value passed to the `FinalizationRegistry` when registering an
 * `IterableWeakMap` key, which provides an automatic cleanup mechanism (called
 * a 'finalizer') that runs when a value becomes unreachable.
 * @internal
 */
type HeldValue<K extends WeakKey = WeakKey, V = any> = {
  ref: WeakRef<K>;
  map: WeakMap<K, WeakPayload<K, V>>;
  set: Set<WeakRef<K>>;
};

const FinalizationRegistry = globalThis.FinalizationRegistry;
const Set = globalThis.Set;
const Object = globalThis.Object;
const WeakMap = globalThis.WeakMap;
const WeakRef = globalThis.WeakRef;
const TypeError = globalThis.TypeError;

// #endregion internal

/**
 * An iterable and performant alternative to the native `WeakMap` API.
 *
 * This class can be used as a drop-in replacement for `WeakMap`, providing an
 * iterable API surface that feels like a standard `Map` without sacrificing
 * the ephemeral memory-efficient behavior of a native `WeakMap`.
 *
 * @example
 * ```ts
 * import { IterableWeakMap } from "@iter/weak-map";
 *
 * // If we used a regular WeakMap here, the key would be inaccessible and
 * // therefore immediately available for garbage collection.
 * const map = new IterableWeakMap([ [{ key: 1 }, 'value1'] ]);
 *
 * // With an IterableWeakMap, however, we can easily obtain a reference to
 * // this [otherwise-unreachable] key, preventing its garbage collection.
 * let key = [...map.keys()][0];
 *
 * try {
 *   console.log(map.get(key)); // => 'value1'
 * } finally {
 *   // dereferencing the key allows it to be garbage collected
 *   key = null!;
 * }
 *
 * // ... some time later, in a different part of the program...
 * console.log(map.size); // => 0
 * ```
 */
export class IterableWeakMap<K extends WeakKey = WeakKey, V = any>
  implements Iterable<[K, V]>, Map<K, V>, WeakMap<K, V> {
  /**
   * Groups members of an iterable according to the return value of the passed
   * `keySelector` callback into a new `IterableWeakMap` instance.
   *
   * @param items An iterable of items to group.
   * @param keySelector A selector callback invoked for each item in `items`,
   * returning the key to group the item by. Must return a valid `WeakKey`.
   * @returns An `IterableWeakMap` containing the grouped items.
   * @example
   * ```ts
   * import { IterableWeakMap } from "@iter/weak-map";
   *
   * const wm = IterableWeakMap.groupBy(
   *   [
   *     [Object.prototype, ["toString", { type: "method", native: true }]],
   *     [IterableWeakMap,  [undefined, { type: "class", static: true }]],
   *     [IterableWeakMap,  ["groupBy", { type: "method", static: true }]],
   *     [IterableWeakMap.prototype, ["has", { type: "method" }]],
   *     [IterableWeakMap.prototype, ["set", { type: "method" }]],
   *   ],
   *   ([target]) => target,
   * );
   *
   * console.log(wm.get(IterableWeakMap));
   * // [
   * //   [
   * //     [class IterableWeakMap],
   * //     [undefined, { type: "class", static: true }],
   * //   ],
   * //   [
   * //     [class IterableWeakMap],
   * //     ["groupBy", { type: "method", static: true }],
   * //   ],
   * // ]
   * console.log(wm.get(Object.prototype));
   * // [
   * //   [
   * //     [Function: Object],
   * //     ["toString", { type: "method", native: true }],
   * //   ],
   * // ]
   * console.log(wm.get(IterableWeakMap.prototype));
   * // [
   * //   [
   * //     [IterableWeakMap],
   * //     ["has", { type: "method" }],
   * //   ],
   * //   [
   * //     [IterableWeakMap],
   * //     ["set", { type: "method" }],
   * //   ],
   * // ]
   * ```
   */
  static groupBy<K extends WeakKey, T>(
    items: Iterable<T>,
    keySelector: (value: T, index: number) => K,
  ): IterableWeakMap<K, T[]> {
    const map = new IterableWeakMap<K, T[]>();
    let index = 0;
    for (const value of items) {
      const key = keySelector(value, index++);
      const values = map.get(key) ?? [];
      values.push(value);
      map.set(key, values);
    }
    return map;
  }

  /** @internal */
  static readonly #registry = new FinalizationRegistry<HeldValue>(
    (heldValue) => {
      const { ref, map, set } = heldValue ?? {};
      if (ref?.deref?.()) {
        set.delete(ref);
        map.delete(ref.deref()!);
      }
    },
  );

  #map = new WeakMap<K, WeakPayload<K, V>>();
  #set = new Set<WeakRef<K>>();
  #reg = IterableWeakMap.#registry;

  /**
   * Creates a new IterableWeakMap, optionally with the items provided as an
   * iterable sequence of `[key, value]` entries. If no entries are provided,
   * the map's initial state will be empty.
   *
   * @param [iterable] entries to initialize the map with.
   * @returns A new IterableWeakMap instance.
   * @example
   * ```ts
   * import { IterableWeakMap } from "@iter/weak-map";
   *
   * const map = new IterableWeakMap([
   *   [{ key: 1 }, 'value1'],
   *   [{ key: 2 }, 'value2']
   * ]);
   *
   * const keys = [...map.keys()];
   * // => [{ key: 1 }, { key: 2 }]
   *
   * const values = [...map.values()];
   * // => ['value1', 'value2']
   * ```
   */
  constructor(iterable?: Iterable<readonly [K, V]> | null);

  /**
   * Creates a new IterableWeakMap from an array of `[key, value]` entries.
   *
   * @param entries initial data to populate the map with.
   * @example
   * ```ts
   * import { IterableWeakMap } from "@iter/weak-map";
   *
   * const map = new IterableWeakMap([
   *   [{ key: 1 }, 'value1'],
   *   [{ key: 2 }, 'value2']
   * ]);
   *
   * const keys = [...map.keys()];
   * // => [{ key: 1 }, { key: 2 }]
   *
   * const values = [...map.values()];
   * // => ['value1', 'value2']
   * ```
   */
  constructor(entries: readonly (readonly [K, V])[] | null);

  /** @internal */
  constructor(entries?: Iterable<readonly [K, V]> | null) {
    for (const [k, v] of entries ?? []) this.set(k, v);
  }

  /** Returns the number of living keys pairs in the map. */
  get size(): number {
    let n = 0;
    for (const ref of this.#set) ref.deref() && n++;
    return n;
  }

  /**
   * Clears all key-value pairs from the map.
   *
   * @example
   * ```ts
   * import { IterableWeakMap } from "@iter/weak-map";
   *
   * const map = new IterableWeakMap([
   *   [{ key: 1 }, 'value1'],
   *   [{ key: 2 }, 'value2'],
   * ]);
   *
   * map.size; // => 2
   * map.clear();
   * map.size; // => 0
   * ```
   */
  clear(): void {
    for (const ref of this.#set) {
      const key = ref.deref();
      if (key) {
        this.#reg.unregister(key);
        this.#map.delete(key);
        this.#set.delete(ref);
      }
    }
    this.#set.clear();
  }

  /**
   * Deletes the key and its associated value from the map.
   *
   * @param key The key of the key to delete.
   * @returns `true` if key and value were deleted; `false` if not.
   * @example
   * ```ts
   * import { IterableWeakMap } from "@iter/weak-map";
   *
   * const obj1 = { key: 1 };
   * const obj2 = { key: 2 };
   *
   * const map = new IterableWeakMap([[obj1, 'value1']]);
   *
   * map.delete(obj1); // => true
   * map.delete(obj2); // => false
   * ```
   */
  delete(key: K): boolean {
    const { k } = this.#map.get(key) ?? {};
    if (k?.deref() === key) {
      this.#reg.unregister(key);
      this.#map.delete(key);
      this.#set.delete(k);
      return true;
    }
    return false;
  }

  /**
   * Gets the value associated with the given key (or a key's weakly-held
   * reference, a WeakRef). Returns `undefined` if the key is not found, or if
   * its value has been garbage collected and therefore is no longer
   * available.
   *
   * @param key The key (or WeakRef of the key) to get the value for. The key
   * must be a non-null object or a non-registered symbol.
   * @returns The value associated with the key, if found.  If the key is not
   * found, or if the WeakRef has been garbage collected, `undefined` is
   * returned instead.
   *
   * @example
   * ```ts
   * import { IterableWeakMap } from "@iter/weak-map";
   *
   * const obj1 = { key: 1 };
   * const map = new IterableWeakMap([[obj1, 'value1']]);
   * const value = map.get(obj1);
   * console.log(value); // Output: 'value1'
   *
   * // ... later on, obj1 is garbage collected ...
   * const value2 = map.get(obj1); // Output: undefined
   * ```
   */
  get(key: K): V | undefined {
    const { k, v } = this.#map.get(key) ?? {};
    if (k?.deref() === key) return v;
    return undefined;
  }

  /**
   * Checks if the given key exists in the map.
   *
   * @param key The key of the key to check.
   * @returns `true` if the key exists, otherwise `false`.
   * @example
   * ```ts
   * import { IterableWeakMap } from "@iter/weak-map";
   * const obj1 = { key: 1 };
   *
   * const map = new IterableWeakMap();
   * map.has(obj1); // => false
   *
   * map.set(obj1, 'value1');
   * map.has(obj1); // => true
   * ```
   */
  has(key: K): boolean {
    const { k } = this.#map.get(key) ?? {};
    if (k?.deref() === key) return true;
    return false;
  }

  /**
   * Sets the value associated with the given key.
   *
   * @param key The key to set the value for.
   * @param value The value to associate with the key.
   * @returns The IterableWeakMap instance.
   * @example
   * ```ts
   * import { IterableWeakMap } from "@iter/weak-map";
   *
   * const map = new IterableWeakMap();
   * map.set({ key: 1 }, 'value1');
   * ```
   */
  set(key: K, value: V): this {
    let { k } = this.#map.get(key) ?? {};
    if (k?.deref() === key) {
      this.#map.set(key, { k, v: value });
      return this;
    }
    k = new WeakRef(key);
    this.#reg.register(key, { ref: k, map: this.#map, set: this.#set }, key);
    this.#map.set(key, { k, v: value });
    this.#set.add(k);
    return this;
  }

  /**
   * Iterates over each key-value pair in the map and invokes the callback
   * function with the key, value, and map as arguments.
   *
   * @param callback The callback function to invoke for each key-value pair.
   * @param [thisArg] The value to use as the contextual `this` binding inside
   * each invocation of the {@link callback} function.
   * @example
   * ```ts
   * import { IterableWeakMap } from "@iter/weak-map";
   *
   * const obj1 = { key: 1 }, obj2 = { key: 2 };
   * const map = new IterableWeakMap([
   *   [obj1, 'value1'],
   *   [obj2, 'value2'],
   * ]);
   *
   * map.forEach((value, key) => {
   *   console.log(`Key: ${key}, Value: ${value}`);
   * });
   * ```
   */
  forEach<This = undefined>(
    callback: (this: This, value: V, key: K, map: this) => void,
    thisArg?: This,
  ): void {
    if (typeof callback !== "function") {
      throw new TypeError(
        `${this.constructor.name}.forEach() expected a callback function, but received ${typeof callback}: ${callback}`,
      );
    }

    for (const [key, value] of this) callback.call(thisArg!, value, key, this);
  }

  /**
   * Returns an iterable iterator for all keys in the map.
   *
   * > **Warning**: Retaining strong references to the keys this method yields
   * > will prevent the garbage collector from reclaiming them. This can cause
   * > non-deterministic behavior and memory leaks. Handle with care.
   *
   * @example
   * ```ts
   * import { IterableWeakMap } from "@iter/weak-map";
   *
   * let obj1 = { key: 1 }, obj2 = { key: 2 };
   * const map = new IterableWeakMap([
   *   [obj1, 'value1'],
   *   [obj2, 'value2'],
   * ]);
   *
   * for (const key of map.keys()) {
   *   console.log(key);
   * }
   *
   * // Retaining strong references to keys prevents gc
   * const toArray = [...map.keys()]; // <-- STRONG REFERENCES TO KEYS!
   *
   * // Dereferencing the keys allows them to be garbage collected
   * obj1 = obj2 = null!;
   *
   * // ... some time later, in a different part of the program...
   * console.log(map.size); // => 2 (?!)
   *
   * // the strong references in `toArray` will indefinitely prevent gc
   * toArray.length = 0;
   *
   * // let's try this again, ... some time later ...
   * console.log(map.size); // => 0
   * ```
   */
  *keys(): MapIterator<K> {
    for (const [key] of this) yield key;
  }

  /**
   * Returns an iterable iterator for all values in the map.
   *
   * @example
   * ```ts
   * import { IterableWeakMap } from "@iter/weak-map";
   *
   * const obj1 = { key: 1 }, obj2 = { key: 2 };
   * const map = new IterableWeakMap([
   *   [obj1, 'value1'],
   *   [obj2, 'value2'],
   * ]);
   *
   * for (const value of map.values()) {
   *   console.log(value);
   * }
   * ```
   */
  *values(): MapIterator<V> {
    for (const [, value] of this) yield value;
  }

  /**
   * Returns an iterator over all key-value pairs (entries) in the map.
   *
   * > **Warning**: Retaining strong references to the keys this method yields
   * > will prevent the garbage collector from reclaiming them. This can cause
   * > non-deterministic behavior and memory leaks. Handle with care.
   *
   * @example
   * ```ts
   * import { IterableWeakMap } from "@iter/weak-map";
   *
   * const obj1 = { key: 1 }, obj2 = { key: 2 };
   * const map = new IterableWeakMap([
   *   [obj1, 'value1'],
   *   [obj2, 'value2'],
   * ]);
   *
   * for (const [key, value] of map.entries()) {
   *   console.log(`Key: ${key}, Value: ${value}`);
   * }
   * ```
   */
  *entries(): MapIterator<[K, V]> {
    for (const ref of this.#set) {
      const r = this.#map.get(ref.deref()!);
      if (r) yield [ref.deref()!, r.v];
    }
  }

  /**
   * Returns an iterator over key-value pairs in the map.
   *
   * @example
   * ```ts
   * import { IterableWeakMap } from "@iter/weak-map";
   *
   * let obj1 = { key: 1 }, obj2 = { key: 2 };
   * const map = new IterableWeakMap([
   *   [obj1, 'value1'],
   *   [obj2, 'value2'],
   * ]);
   *
   * for (const [key, value] of map) {
   *   console.log(`Key: ${key}, Value: ${value}`);
   * }
   *
   * const toArray = [...map]; // <- KEEPS STRONG REFERENCES TO KEYS! FOREVER!
   *
   * // to allow the map's items to be reclaimed, we must dereference the keys:
   * obj1 = obj2 = null!;
   *
   * // arrays keep strong referencess to their items, so we clear that too:
   * toArray.length = 0;
   * ```
   */
  *[Symbol.iterator](): MapIterator<[K, V]> {
    return yield* this.entries();
  }

  /** @internal */
  declare readonly [Symbol.toStringTag]: string;

  static {
    // simplify stack traces
    this.prototype[Symbol.iterator] = this.prototype.entries;

    Object.defineProperties(this.prototype, {
      [Symbol.toStringTag]: {
        value: "IterableWeakMap",
        configurable: true,
      },
      [Symbol.for("nodejs.util.inspect.custom")]: {
        value: function (
          this: IterableWeakMap,
          depth: number | null,
          options: Record<string, unknown>,
        ): string {
          const name = "IterableWeakMap", tag = `[${name}]`;
          // prevent errors when inspecting the prototype itself
          // (which has no entries, and cannot access #private members)
          if (this === IterableWeakMap.prototype) return tag;
          if (depth != null && depth <= 0) {
            if (!options?.colors) return tag;
            if (typeof options?.stylize === "function") {
              return options?.stylize(tag, "special");
            }
            return `\x1b[96m${tag}\x1b[39m`;
          }
          // TODO(nberlette): add support for previewing weak entries!!
          let value = "<items hidden>";
          if (options?.colors) {
            if (typeof options?.stylize === "function") {
              value = options?.stylize(value, "special");
            } else {
              value = `\x1b[96m${value}\x1b[39m`;
            }
          }
          return `${name}(${this.size}) { ${value} }`;
        },
        configurable: true,
      },
    });
  }
}

/**
 * An iterable alternative to the native `WeakMap` API.
 *
 * See the module-level documentation, or the {@linkcode IterableWeakMap} class
 * for more information and usage examples.
 */
export default IterableWeakMap;
