/**
 * An iterable alternative to the native `WeakSet` class, with an API that
 * mirrors the native `Set` class, including the latest additions from the
 * TC39 Set Methods proposal (ES2024+).
 *
 * By leveraging the `WeakRef` and `FinalizationRegistry` APIs, this class is
 * able to behave as an iterable collection of weakly-held references, without
 * preventing garbage collection of the values it contains.
 *
 * @example
 * ```ts
 * import { IterableWeakSet } from "@iter/weak-set";
 *
 * const set = new IterableWeakSet([{ key: 1 }, { key: 2 }]);
 *
 * // This is a strong reference that will prevent garbage collection:
 * const values = [...set];
 * //    ^? const values: { key: number }[]
 *
 * // dereference the values and free memory
 * values.length = 0;
 * ```
 *
 * @see https://jsr.io/@iter/weak-set/doc for the API documentation.
 * @see https://github.com/tc39/proposal-weakrefs#iterable-weakmaps
 */
export class IterableWeakSet<T extends WeakKey>
  implements Iterable<T>, WeakSet<T> {
  static readonly #registry = new FinalizationRegistry<{
    map: WeakMap<WeakKey, { ref: WeakRef<WeakKey> }>;
    ref: WeakRef<WeakKey> | undefined;
    set: Set<WeakRef<WeakKey>>;
  }>(({ map, ref, set }) => {
    if (ref?.deref()) {
      set.delete(ref);
      map.delete(ref.deref()!);
      IterableWeakSet.#registry.unregister(ref.deref()!);
    }
    map = set = ref = undefined!;
  });

  #set = new Set<WeakRef<T>>();
  #map = new WeakMap<T, { ref: WeakRef<T> }>();
  #reg = IterableWeakSet.#registry;

  /**
   * Creates a new `IterableWeakSet` from an iterable sequence of values.
   *
   * @param [values] values to initialize the set with.
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const set = new IterableWeakSet([{ key: 1 }, { key: 2 }]);
   *
   * set.size; // => 2
   * ```
   */
  constructor(values?: Iterable<T> | null) {
    for (const v of values ?? []) this.add(v);
  }

  /** Returns the number of living keys pairs in the set. */
  get size(): number {
    let n = 0;
    for (const r of this.#set) {
      if (r.deref()) n++;
      else this.#set.delete(r);
    }
    return n;
  }

  /**
   * Adds a weakly-held value to the set.
   *
   * @param value The value to add to the set.
   * @returns The `IterableWeakSet` instance, for chaining.
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const set = new IterableWeakSet();
   * set.add({ key: 1 }).add({ key: 2 });
   * set.size; // => 2
   * ```
   */
  add(value: T): this {
    let { ref } = this.#map.get(value) ?? {};
    if (ref && ref.deref() !== value) {
      this.#reg.unregister(value);
      this.#set.delete(ref);
      this.#map.delete(value);
    }
    ref ??= new WeakRef(value);
    const map = this.#map.set(value, { ref });
    const set = this.#set.add(ref);
    this.#reg.register(value, { map, ref, set }, value);
    return this;
  }

  /**
   * Clears all values from the set.
   *
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const set = new IterableWeakSet([{ key: 1 }, { key: 2 }]);
   *
   * set.size; // => 2
   * set.clear();
   * set.size; // => 0
   * ```
   */
  clear(): void {
    for (const r of this.#set) this.delete(r.deref()!);
    this.#set.clear();
  }

  /**
   * Deletes a value from the set.
   *
   * @param value The weakly-held value to delete.
   * @returns `true` if value was deleted; `false` if not.
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const obj1 = { key: 1 };
   * const set = new IterableWeakSet([obj1]);
   *
   * set.delete(obj1); // => true
   * set.delete(obj1); // => false
   * ```
   */
  delete(value: T): boolean {
    const { ref } = this.#map.get(value) ?? {};
    if (ref) {
      // we dont chain these into a single conditional to ensure all three of
      // these operations are executed, even if one of them fails.
      this.#reg.unregister(value);
      this.#map.delete(value);
      return this.#set.delete(ref);
    } else {
      return false;
    }
  }

  /**
   * Checks if a given value or reference to it exists in the set.
   *
   * @param value The value to check for.
   * @returns `true` if the value exists, otherwise `false`.
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   * const obj1 = { key: 1 };
   *
   * const set = new IterableWeakSet();
   * set.has(obj1); // => false
   * set.add(obj1); // add the object to the set
   * set.has(obj1); // => true
   * ```
   */
  has(value: T): boolean {
    return this.#map.get(value)?.ref?.deref?.() === value;
  }

  /**
   * Returns a new {@linkcode IterableWeakSet} instance that contains the
   * values of the current set, followed by the values of the provided set.
   * This method does not modify the original set.
   *
   * This method follows the same semantics as the [`Set.prototype.union`]
   * method introduced by the [TC39 Set Methods Proposal]. The `other` argument
   * can be any "set-like" object that implements a `size` property and `has`
   * and `keys` methods.
   *
   * For example, passing a `Map` instance to this method (which also satisfies
   * the "set-like" interface) will give the same result as passing a `Set`
   * instance containing its keys.
   *
   * [`Set.prototype.union`]: https://github.com/tc39/proposal-set-methods#union
   * [TC39 Set Methods Proposal]: https://github.com/tc39/proposal-set-methods
   *
   * @param other The set to merge with the current set.
   * @returns A new `IterableWeakSet` instance containing the merged values.
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const obj1 = { key: 1 }, obj2 = { key: 2 };
   * const set1 = new IterableWeakSet([obj1]);
   * const set2 = new IterableWeakSet([obj2]);
   *
   * const union = set1.union(set2);
   * console.log(union); // => IterableWeakSet (2) { { key: 1 }, { key: 2 } }
   * ```
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const obj1 = { key: 1 }, obj2 = { key: 2 }, obj3 = { key: 3 };
   *
   * const set1 = new IterableWeakSet([obj1]);
   * const set2 = new Set([obj2, obj3]);
   *
   * // cross-compatible APIs!
   * const set3 = set1.union(set2);
   * //    ^? const set3: IterableWeakSet<{ key: number }>
   *
   * console.log(set3);
   * // IterableWeakSet(3) { { key: 1 }, { key: 2 }, { key: 3 } }
   * ```
   */
  union<U extends WeakKey>(other: ReadonlySetLike<U>): IterableWeakSet<T | U> {
    const union = new IterableWeakSet<T | U>();
    for (const value of this.keys()) union.add(value);
    for (const value of iterable(other.keys())) union.add(value);
    return union;
  }

  /**
   * Returns a new {@linkcode IterableWeakSet} instance containing the values
   * of this set that are also present in `other`. This method does not modify
   * either of the original sets.
   *
   * This method follows the same semantics as the
   * [`Set.prototype.intersection`] method introduced by the [TC39 Set Methods
   * Proposal]. The `other` argument can be any "set-like" object that
   * implements a `size` property and `has` and `keys` methods.
   *
   * For example, passing a `Map` instance to this method (which also satisfies
   * the "set-like" interface) will give the same result as passing a `Set`
   * instance containing its keys.
   *
   * [`Set.prototype.intersection`]: https://github.com/tc39/proposal-set-methods#intersection
   * [TC39 Set Methods Proposal]: https://github.com/tc39/proposal-set-methods
   *
   * @param other The set to compare with the current set.
   * @returns A new `IterableWeakSet` instance containing the intersection
   * values.
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const a = { k: "a" }, b = { k: "b" }, c = { k: "c" };
   * const set1 = new IterableWeakSet([a, b]);
   * const set2 = new IterableWeakSet([b, c]);
   *
   * const intersection = set1.intersection(set2);
   * console.log(intersection); // => IterableWeakSet (1) { { k: "b" } }
   * ```
   */
  intersection<U extends WeakKey>(
    other: ReadonlySetLike<U>,
  ): IterableWeakSet<T & U> {
    const intersection = new IterableWeakSet<T & U>();
    for (const value of this.keys()) {
      if (other.has(value as T & U)) intersection.add(value as T & U);
    }
    return intersection;
  }

  /**
   * Returns a new {@linkcode IterableWeakSet} instance that contains the
   * values of the current set, excluding any values that are also present in
   * the provided set. This method does not modify the original set.
   *
   * This method follows the same semantics as the [`Set.prototype.difference`]
   * method introduced by the [TC39 Set Methods Proposal]. The `other` argument
   * can be any "set-like" object that implements a `size` property and `has`
   * and `keys` methods.
   *
   * For example, passing a `Map` instance to this method (which also satisfies
   * the "set-like" interface) will give the same result as passing a `Set`
   * instance containing its keys.
   *
   * [`Set.prototype.difference`]: https://github.com/tc39/proposal-set-methods#difference
   * [TC39 Set Methods Proposal]: https://github.com/tc39/proposal-set-methods
   *
   * @param other The set to compare with the current set.
   * @returns A new `IterableWeakSet` containing the difference values.
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const a = { k: 1 }, b = { k: 2 }, c = { k: 3 };
   * const set1 = new IterableWeakSet([a, b]);
   * const set2 = new IterableWeakSet([b]);
   *
   * console.log(set1.difference(set2)); // => IterableWeakSet (1) { { k: 1 } }
   * ```
   */
  difference<U extends WeakKey>(
    other: ReadonlySetLike<U>,
  ): IterableWeakSet<T> {
    const difference = new IterableWeakSet<T>();
    for (let value of this.keys()) {
      if (!other.has(value as T & U)) difference.add(value);
      value = null!;
    }
    return difference;
  }

  /**
   * Returns a new {@linkcode IterableWeakSet} instance containing the values
   * of the current set and the provided set, excluding any values that are
   * present in both sets. This method does not modify the original set.
   *
   * This follows the same semantics as [`Set.prototype.symmetricDifference`]
   * introduced by the [TC39 Set Methods Proposal]. The `other` argument can be
   * any "set-like" object that implements a `size` property and `has` and
   * `keys` methods.
   *
   * For example, passing a `Map` instance to this method (which also satisfies
   * the "set-like" interface) will give the same result as passing a `Set`
   * instance containing its keys.
   *
   * [`Set.prototype.symmetricDifference`]: https://github.com/tc39/proposal-set-methods#symmetricdifference
   * [TC39 Set Methods Proposal]: https://github.com/tc39/proposal-set-methods
   *
   * @param other The set to compare with the current set.
   * @returns A new `IterableWeakSet` instance containing the symmetric
   * difference values.
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const a = { k: 1 }, b = { k: 2 }, c = { k: 3 };
   * const set1 = new IterableWeakSet([a, b]);
   * const set2 = new IterableWeakSet([b, c]);
   *
   * const symmetricDifference = set1.symmetricDifference(set2);
   * console.log(symmetricDifference);
   * // => IterableWeakSet (2) { { k: 1 }, { k: 3 } }
   * ```
   */
  symmetricDifference<U extends WeakKey>(
    other: ReadonlySetLike<U>,
  ): IterableWeakSet<T | U> {
    const symmetricDifference = new IterableWeakSet<T | U>();
    for (let value of this.keys()) {
      if (!other.has(value as T & U)) symmetricDifference.add(value);
      value = null!;
    }
    for (let value of iterable(other.keys())) {
      if (!this.has(value as T & U)) symmetricDifference.add(value);
      value = null!;
    }
    return symmetricDifference;
  }

  /**
   * Checks if the current set is a subset of the provided set. A set is a
   * subset of another set if all of its elements are contained within the
   * other set.
   *
   * This method follows the same semantics as the [`Set.prototype.isSubsetOf`]
   * method introduced by the [TC39 Set Methods Proposal]. The `other` argument
   * can be any "set-like" object that implements a `size` property and `has`
   * and `keys` methods.
   *
   * [`Set.prototype.isSubsetOf`]: https://github.com/tc39/proposal-set-methods#issubsetof
   * [TC39 Set Methods Proposal]: https://github.com/tc39/proposal-set-methods
   *
   * @param other The set to compare with the current set.
   * @returns `true` if the current set is a subset of the provided set;
   * otherwise `false`.
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const a = { k: 1 }, b = { k: 2 }, c = { k: 3 };
   * const set1 = new IterableWeakSet([a, b]);
   * const set2 = new IterableWeakSet([a, b, c]);
   *
   * set1.isSubsetOf(set2); // => true
   * ```
   */
  isSubsetOf<U extends WeakKey>(
    other: ReadonlySetLike<U>,
  ): boolean {
    for (let value of this.keys()) {
      if (!other.has(value as T & U)) return false;
      value = null!;
    }
    return true;
  }

  /**
   * Checks if the current set is a superset of the provided set. A set is a
   * superset of another if it contains all of the elements of the other set.
   *
   * This follows the same semantics as the [`Set.prototype.isSupersetOf`]
   * method introduced by the [TC39 Set Methods Proposal]. The `other` argument
   * can be any "set-like" object that implements a `size` property and `has`
   * and `keys` methods.
   *
   * [`Set.prototype.isSupersetOf`]: https://github.com/tc39/proposal-set-methods#issupersetof
   * [TC39 Set Methods Proposal]: https://github.com/tc39/proposal-set-methods
   *
   * @param other The set to compare with the current set.
   * @returns `true` if the current set is a superset of the provided set;
   * otherwise `false`.
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const a = { k: 1 }, b = { k: 2 }, c = { k: 3 };
   * const set1 = new IterableWeakSet([a, b, c]);
   * const set2 = new IterableWeakSet([a, b]);
   *
   * set1.isSupersetOf(set2); // => true
   * ```
   */
  isSupersetOf<U extends WeakKey>(
    other: ReadonlySetLike<U>,
  ): boolean {
    for (let value of iterable(other.keys())) {
      if (!this.has(value as T & U)) return false;
      value = null!;
    }
    return true;
  }

  /**
   * Checks if the current set is disjoint from the provided set, meaning they
   * have no elements in common.
   *
   * This method follows the same semantics as [`Set.prototype.isDisjointFrom`]
   * introduced by the [TC39 Set Methods Proposal]. The `other` argument can be
   * any "set-like" object that implements a `size` property and `has` and
   * `keys` methods.
   *
   * [`Set.prototype.isDisjointFrom`]: https://github.com/tc39/proposal-set-methods#isdisjointfrom
   * [TC39 Set Methods Proposal]: https://github.com/tc39/proposal-set-methods
   *
   * @param other The set to compare with the current set.
   * @returns `true` if the current set is disjoint from the provided set;
   * otherwise `false`.
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const a = { k: 1 }, b = { k: 2 }, c = { k: 3 };
   * const set1 = new IterableWeakSet([a, b]);
   * const set2 = new IterableWeakSet([c]);
   *
   * set1.isDisjointFrom(set2); // => true
   * ```
   */
  isDisjointFrom<U extends WeakKey>(
    other: ReadonlySetLike<U>,
  ): boolean {
    for (let value of this.keys()) {
      if (other.has(value as T & U)) return false;
      value = null!;
    }
    return true;
  }

  /**
   * Iterates over each item in the set, and invokes the callback function
   * with the key, value, and set as arguments.
   *
   * @param callback The callback function to invoke for each key-value pair.
   * @param [thisArg] The value to use as the contextual `this` binding inside
   * each invocation of the {@link callback} function.
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const obj1 = { key: 1 }, obj2 = { key: 2 };
   * const set = new IterableWeakSet([obj1, obj2]);
   *
   * set.forEach((value, value2, set) => {
   *   console.log(value, value2, set);
   * });
   * ```
   */
  forEach<This = void>(
    callback: (this: This, value: T, value2: T, set: this) => void,
    thisArg?: This,
  ): void {
    if (typeof callback !== "function") {
      throw new TypeError(
        `${this.constructor.name}.forEach() expected a callback function, but received type ${typeof callback} (${callback}).`,
      );
    }
    for (let [value, value2] of this.entries()) {
      callback.call(thisArg!, value, value2, this);
      value = value2 = null!;
    }
  }

  /**
   * Returns an iterable iterator for all keys in the set.
   *
   * > **Warning**: Ensure that the keys yielded by this method are handled
   * > appropriately.  Retaining strong references to keys can quickly cause
   * > non-deterministic behavior, often leading to memory leaks and garbage
   * > collection issues.
   *
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const obj1 = { key: 1 }, obj2 = { key: 2 };
   * const set = new IterableWeakSet([obj1, obj2]);
   *
   * for (const key of set.keys()) console.log(key);
   *
   * // or using the spread operator:
   * const keys1 = [...set.keys()];
   * ```
   */
  *keys(): SetIterator<T> {
    return yield* this.values();
  }

  /**
   * Returns an iterable iterator for all values in the set.
   *
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const obj1 = { key: 1 }, obj2 = { key: 2 };
   * const set = new IterableWeakSet([obj1, obj2]);
   *
   * for (const value of set.values()) console.log(value);
   *
   * // or using the spread operator:
   * const values1 = [...set.values()];
   * ```
   */
  *values(): SetIterator<T> {
    for (const r of this.#set) {
      const value = r.deref();
      if (value) {
        yield value;
      } else {
        this.#set.delete(r);
      }
    }
  }

  /**
   * Returns an iterator over all key-value pairs (entries) in the set.
   *
   * > **Warning**: Ensure that the keys yielded by this method are handled
   * > appropriately.  Retaining strong references to keys can quickly cause
   * > non-deterministic behavior, often leading to memory leaks and garbage
   * > collection issues.
   *
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const obj1 = { key: 1 }, obj2 = { key: 2 };
   * const set = new IterableWeakSet([obj1, obj2]);
   *
   * for (const [key, value] of set.entries()) console.log(key, value);
   *
   * // or using the spread operator:
   * const entries1 = [...set.entries()];
   * ```
   */
  *entries(): SetIterator<[T, T]> {
    for (const key of this.keys()) yield [key, key];
  }

  /**
   * Returns an iterator over all values in the set.
   *
   * @returns An iterator over all values in the set.
   * @example
   * ```ts
   * import { IterableWeakSet } from "@iter/weak-set";
   *
   * const obj1 = { key: 1 }, obj2 = { key: 2 };
   * const set = new IterableWeakSet([obj1, obj2]);
   *
   * for (const value of set) console.log(value);
   *
   * // or using the spread operator:
   * const values1 = [...set];
   *
   * // or using the `Array.from` method:
   * const values2 = Array.from(set);
   * ```
   */
  *[Symbol.iterator](): SetIterator<T> {
    return yield* this.values();
  }

  /** @internal */
  declare readonly [Symbol.toStringTag]: string;

  static get [Symbol.species](): new () => ReadonlySetLike<WeakKey> {
    return Set;
  }

  static {
    // simplify stack traces by merging aliases
    this.prototype[Symbol.iterator] = this.prototype.values;
    this.prototype.keys = this.prototype.values;

    Object.defineProperties(this.prototype, {
      [Symbol.toStringTag]: {
        value: "IterableWeakSet",
        configurable: true,
        writable: true,
      },
      [Symbol.for("nodejs.util.inspect.custom")]: {
        value: function (
          this: IterableWeakSet<WeakKey>,
          depth: number,
          options: Record<string, unknown>,
        ) {
          const name = "IterableWeakSet", tag = `[${name}]`;
          // prevent errors when inspecting the prototype itself
          // (which has no entries, and cannot access #private members)
          if (this === IterableWeakSet.prototype) return tag;
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

export default IterableWeakSet;

// #region internal

function* iterable<T>(
  it: Iterator<T> | Iterable<T> | null,
  strict = true,
): IterableIterator<T> {
  if (it == null) return;
  if (Symbol.iterator in it && typeof it[Symbol.iterator] === "function") {
    return yield* it;
  } else if (
    typeof it === "object" && "next" in it && typeof it.next === "function"
  ) {
    let value: T | undefined;
    while (!({ value } = it.next()).done) yield value!;
  } else if (strict) {
    throw new TypeError(
      `Expected an iterable or iterator, but received type ${typeof it} (${it}).`,
    );
  }
}

// #endregion internal
