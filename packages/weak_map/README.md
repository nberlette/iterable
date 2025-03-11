<div align="center">

# [`@iter/weak-map`]

<big><b>An iterable alternative to the native `WeakMap` API.</b></big><br>

<small><b>High-fidelity, dependency-free, and platform-agnostic.</b></small><br>

[![][badge-jsr-pkg]][jsr] [![][badge-jsr-score]][jsr]

</div>

---

This package provides the [`IterableWeakMap`] class, which serves as an
**_iterable_** drop-in replacement for the standard [`WeakMap`] class. With a
familiar public API that implements the standard [`Map`] interface, allowing you
to observe its entries without sacrificing the memory-safe aspects of its native
counterpart.

## Install

The package is distributed on [JSR] as **[`@iter/weak-map`]**.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://api.iconify.design/simple-icons:deno.svg?height=2.75rem&width=3rem&color=white">
  <img align="right" src="https://api.iconify.design/simple-icons:deno.svg?height=2.75rem&width=3rem" height="44" width="48" alt="Deno" />
</picture>

```sh
deno add jsr:@iter/weak-map
```

[<img align="left" src="https://api.iconify.design/simple-icons:jsr.svg?color=%23fb0&width=3rem&height=2.75rem&inline=true" alt="JSR" />][jsr]

```sh
npx jsr add @iter/weak-map
```

[<img align="right" src="https://api.iconify.design/logos:bun.svg?height=3rem&width=3rem&inline=true" alt="Bun" />][bun]

```sh
bunx jsr add @iter/weak-map
```

[<img align="left" src="https://api.iconify.design/logos:pnpm.svg?height=3rem&width=3rem&inline=true" alt="PNPM" />][pnpm]

```sh
pnpm dlx jsr add @iter/weak-map
```

[<img align="right" src="https://api.iconify.design/logos:yarn.svg?height=2.5rem&width=3rem&inline=true" alt="Yarn" />][yarn]

```sh
yarn dlx jsr add @iter/weak-map
```

## Usage

```ts
import { IterableWeakMap } from "@iter/weak-map";

const map = new IterableWeakMap([
  [{ k: 1 }, "value1"],
  [{ k: 2 }, "value2"],
]);

// oh no, we have no references to the keys!

map.get([...map.keys()][0]); // => "value1"

console.log([...map]); // => [[{ k: 1 }, "value1"], [{ k: 2 }, "value2"]]

// later on, after the keys are garbage-collected...
console.log([...map]); // => []
```

---

## API

<details open><summary><b><u>Table of Contents</u></b></summary><br>

- **[`IterableWeakMap`](#iterableweakmap)**
  - [`constructor`](#constructor)
  - [`size`](#size)
  - [`clear`](#clear)
  - [`delete`](#delete)
  - [`get`](#get)
  - [`has`](#has)
  - [`set`](#set)
  - [`forEach`](#foreach)
  - [`keys`](#keys)
  - [`values`](#values)
  - [`entries`](#entries)
  - [`[Symbol.iterator]`](#symboliterator)
  - [`groupBy` <sup><i>(static)</i></sup>](#groupby)
- [Further Reading](#further-reading)
  - [Garbage Collection and Predictability](#garbage-collection-and-predictability)
  - [What is _"Weak Iteration"_?](#what-is-weak-iteration)
  - [How's it all work?](#hows-it-all-work)

</details>

## `IterableWeakMap` <img align="left" src="https://img.shields.io/badge/class-lightgreen.svg?style=flat" style="margin-top:3px" alt="class" />

> **Implements**: `WeakMap<K, V>`, `Iterable<[K, V]>`

### Constructor

```ts ignore
new IterableWeakMap(entries?: Iterable<[K, V]> | null);
```

Creates a new `IterableWeakMap<K, V>` instance, optionally initializing it with
an iterable of `[K, V]` entries.

If provided, every item in the sequence must be a tuple pair of `K` (a
`WeakKey`), and an arbitrary value `V`.

#### Parameters

| Parameter      | Info                                                         |
| :------------- | :----------------------------------------------------------- |
| **`entries`**† | Iterable of weak keys and values to initialize the map with. |

> **_†_** Optional. If provided, must be an iterable sequence of `[K, V]` pairs.

#### Examples

```ts
import { IterableWeakMap } from "@iter/weak-map";

const map = new IterableWeakMap([
  [{ k: 1 }, "value1"],
  [{ k: 2 }, "value2"],
]);

const keys = [...map.keys()];
// => [{ k: 1 }, { k: 2 }]

const values = [...map.values()];
// => ['value1', 'value2']
```

---

### `size` <img align="left" src="https://img.shields.io/badge/readonly-e74.svg?style=flat" style="margin-top:3px" alt="readonly" />

```ts ignore
get size(): number;
```

#### Returns

The number of living values in the map.

---

### `clear` <img align="left" src="https://img.shields.io/badge/method-57f.svg?style=flat" style="margin-top:3px" alt="public" />

```ts ignore
clear(): void;
```

Clears all key-value pairs from the map.

#### Examples

```ts
import { IterableWeakMap } from "@iter/weak-map";

const map = new IterableWeakMap([
  [{ k: 1 }, "value1"],
  [{ k: 2 }, "value2"],
]);

map.size; // => 2
map.clear();
map.size; // => 0
```

---

### `delete` <img align="left" src="https://img.shields.io/badge/method-57f.svg?style=flat" style="margin-top:3px" alt="public" />

```ts ignore
delete(key: K | WeakRef<K>): boolean;
```

Deletes the key and its associated value from the map.

#### Parameters

| Name      | Info                                     |
| :-------- | :--------------------------------------- |
| **`key`** | The key or WeakRef of the key to delete. |

#### Returns

`true` if key and value were deleted; `false` if not.

#### Examples

```ts
import { IterableWeakMap } from "@iter/weak-map";

const a = { k: 1 }, b = { k: 2 }, c = { k: 3 };

const map = new IterableWeakMap([[a, "v1"], [b, "v2"], [c, "v3"]]);

map.delete(a); // => true
map.delete(b); // => false
```

---

### `get` <img align="left" src="https://img.shields.io/badge/method-57f.svg?style=flat" style="margin-top:3px" alt="public" />

```ts ignore
get(key: K | WeakRef<K>): V | undefined;
```

Gets the value associated with the given key (or a key's weakly-held reference,
a WeakRef). Returns `undefined` if the key is not found, or if its value has
been garbage collected and therefore is no longer available.

#### Parameters

| Name      | Info                                                                                                                |
| :-------- | :------------------------------------------------------------------------------------------------------------------ |
| **`key`** | The key (or WeakRef of the key) to get the value for. The key must be a non-null object or a non-registered symbol. |

#### Returns

The value associated with the key, if found. If the key is not found, or if the
WeakRef has been garbage collected, `undefined` is returned instead.

#### Examples

```ts
import { IterableWeakMap } from "@iter/weak-map";

const obj1 = { k: 1 };
const map = new IterableWeakMap([[obj1, "value1"]]);
const value = map.get(obj1);
console.log(value); // Output: 'value1'

// ... later on, after obj1 is garbage collected ...

const value2 = map.get(obj1); // Output: undefined
```

---

### `has` <img align="left" src="https://img.shields.io/badge/method-57f.svg?style=flat" style="margin-top:3px" alt="public" />

```ts ignore
has(key: K | WeakRef<K>): boolean;
```

Checks if the given key or reference exists in the map.

#### Parameters

| Name      | Info                                    |
| :-------- | :-------------------------------------- |
| **`key`** | The key or WeakRef of the key to check. |

#### Returns

`true` if the key exists, otherwise `false`.

#### Examples

```ts
import { IterableWeakMap } from "@iter/weak-map";
const obj1 = { k: 1 };

const map = new IterableWeakMap();
map.has(obj1); // => false

map.set(obj1, "value1");
map.has(obj1); // => true
```

---

### `set` <img align="left" src="https://img.shields.io/badge/method-57f.svg?style=flat" style="margin-top:3px" alt="public" />

```ts ignore
set(key: K | WeakRef<K>, value: V): IterableWeakMap<K, V>;
```

Sets the value associated with the given key or reference.

#### Parameters

| Name        | Info                                     |
| :---------- | :--------------------------------------- |
| **`key`**   | The key or WeakRef to set the value for. |
| **`value`** | The value to associate with the key.     |

#### Returns

The IterableWeakMap instance.

#### Examples

```ts
import { IterableWeakMap } from "@iter/weak-map";

const map = new IterableWeakMap();
map.set({ k: 1 }, "value1");
```

---

### `forEach` <img align="left" src="https://img.shields.io/badge/method-57f.svg?style=flat" style="margin-top:3px" alt="public" />

```ts ignore
forEach(
  callback: (value: V, key: K, map: IterableWeakMap<K, V>) => void,
  thisArg?: unknown,
): void;
```

Iterates over each key-value pair in the map and invokes the callback function
with the key, value, and map as arguments.

#### Parameters

| Name           | Info                                                             |
| :------------- | :--------------------------------------------------------------- |
| **`callback`** | The callback function to invoke for each key-value pair.         |
| **`thisArg`**  | The value to use as the contextual `this` binding in `callback`. |

#### Examples

```ts
import { IterableWeakMap } from "@iter/weak-map";

const obj1 = { k: 1 }, obj2 = { k: 2 };
const map = new IterableWeakMap([
  [obj1, "value1"],
  [obj2, "value2"],
]);

map.forEach((value, key) => {
  console.log(`Key: ${key}, Value: ${value}`);
});
```

---

### `keys` <img align="left" src="https://img.shields.io/badge/generator-f060a0.svg?style=flat" style="margin-top:3px" alt="generator" />

```ts ignore
*keys(): IterableIterator<K>;
```

#### Returns

An iterable iterator for all keys in the map.

#### Examples

```ts
import { IterableWeakMap } from "@iter/weak-map";

const obj1 = { k: 1 }, obj2 = { k: 2 };
const map = new IterableWeakMap([
  [obj1, "value1"],
  [obj2, "value2"],
]);

for (const key of map.keys()) {
  console.log(key);
}
```

---

### `values` <img align="left" src="https://img.shields.io/badge/generator-f060a0.svg?style=flat" style="margin-top:3px" alt="generator" />

```ts ignore
*values(): IterableIterator<V>;
```

#### Returns

An iterable iterator for all values in the map.

#### Examples

```ts
import { IterableWeakMap } from "@iter/weak-map";

const obj1 = { k: 1 }, obj2 = { k: 2 };
const map = new IterableWeakMap([
  [obj1, "value1"],
  [obj2, "value2"],
]);

for (const value of map.values()) {
  console.log(value);
}
```

---

### `entries` <img align="left" src="https://img.shields.io/badge/generator-f060a0.svg?style=flat" style="margin-top:3px" alt="generator" />

```ts ignore
*entries(): IterableIterator<[K, V]>;
```

#### Returns

An iterator over all key-value pairs (entries) in the map.

#### Examples

```ts
import { IterableWeakMap } from "@iter/weak-map";

const obj1 = { k: 1 }, obj2 = { k: 2 };
const map = new IterableWeakMap([
  [obj1, "value1"],
  [obj2, "value2"],
]);

for (const [key, value] of map.entries()) {
  console.log(`Key: ${key}, Value: ${value}`);
}
```

---

### `[Symbol.iterator]` <img align="left" src="https://img.shields.io/badge/generator-f060a0.svg?style=flat" style="margin-top:3px" alt="generator" />

```ts ignore
*[Symbol.iterator](): IterableIterator<[K, V]>;
```

Returns an iterator over key-value pairs in the map.

#### Returns

An iterator over all key-value pairs.

#### Examples

```ts
import { IterableWeakMap } from "@iter/weak-map";

const obj1 = { k: 1 }, obj2 = { k: 2 };
const map = new IterableWeakMap([
  [obj1, "value1"],
  [obj2, "value2"],
]);

for (const [key, value] of map) {
  console.log(`Key: ${key}, Value: ${value}`);
}

const toArray = [...map];
```

---

### `groupBy` <img align="left" src="https://img.shields.io/badge/static-e83.svg?style=flat" style="margin-top:3px" alt="(static)" />

```ts ignore
static groupBy<K extends WeakKey, T>(
  items: Iterable<T>,
  keySelector: (item: T, index: number) => K,
): IterableWeakMap<K, T[]>;
```

Groups members of an iterable according to the return value of the passed
`keySelector` callback into a new `IterableWeakMap` instance.

#### Parameters

| Parameter         | Info                                                                                         |
| :---------------- | :------------------------------------------------------------------------------------------- |
| **`items`**       | An iterable of items to group into a new `IterableWeakMap`.                                  |
| **`keySelector`** | Invoked once for each item in `items`. Returns the key to group the item by, as a `WeakKey`. |

#### Returns

An `IterableWeakMap` containing the grouped items.

#### Examples

```ts
import { IterableWeakMap } from "@iter/weak-map";

const wm = IterableWeakMap.groupBy(
  [
    [Object.prototype, ["toString", { type: "method", native: true }]],
    [IterableWeakMap, [undefined, { type: "class", static: true }]],
    [IterableWeakMap, ["groupBy", { type: "method", static: true }]],
    [IterableWeakMap.prototype, ["has", { type: "method" }]],
    [IterableWeakMap.prototype, ["set", { type: "method" }]],
  ],
  ([target]) => target,
);

console.assert(wm.has(IterableWeakMap));
console.assert(wm.get(IterableWeakMap)!.length === 2);

console.assert(wm.has(Object.prototype));
console.assert(wm.get(Object.prototype)!.length === 1);

console.assert(wm.has(IterableWeakMap.prototype));
console.assert(wm.get(IterableWeakMap.prototype)!.length === 2);

console.log(wm.get(IterableWeakMap));
// [
//   [
//     [class IterableWeakMap],
//     [undefined, { type: "class", static: true }],
//   ],
//   [
//     [class IterableWeakMap],
//     ["groupBy", { type: "method", static: true }],
//   ],
// ]
console.log(wm.get(Object.prototype));
// [
//   [
//     [Function: Object],
//     ["toString", { type: "method", native: true }],
//   ],
// ]
console.log(wm.get(IterableWeakMap.prototype));
// [
//   [
//     [IterableWeakMap],
//     ["has", { type: "method" }],
//   ],
//   [
//     [IterableWeakMap],
//     ["set", { type: "method" }],
//   ],
// ]
```

---

## Further Reading

<details><summary><big><b>⚠️ <u>Important differences</u> between this and <code>WeakMap</code></b></big></summary>

<br>

It is important to note that this class is _not_ a subclass of a native
`WeakMap` instance, and as such it does not satisfy any `instanceof` checks or
type comparisons against the native `WeakMap` constructor function.

Instead, this is a standalone class that uses several advanced native APIs to
provide an interface that feels and behaves much like a standard Map on the
surface, while maintaining the same [ephemeral] nature of a standard `WeakMap`
underneath. See the section on [weak iteration](#what-is-weak-iteration) and
[how it all works](#hows-it-all-work) for more information on this.

</details>

<details open><summary><big><b><u>Garbage Collection and Predictability</u></b></big></summary>

<a id="garbage-collection-and-predictability"></a>

Garbage Collection (GC) is the process by which the JavaScript runtime reclaims
memory that is no longer in use by the program. This is done automatically by
the runtime, and is not something that can typically be controlled by the
developer.

The GC engine in JavaScript runtimes is designed to be non-deterministic, such
that the timing of an object's lifecycle is not something one can predict. This
is a fundamental design characteristic (and frequent pain point) of the GC
engine in JavaScript runtimes, and not a problem unique to [`IterableWeakMap`].

</details>

<details><summary><big><b><u>What is <i>"Weak Iteration"</i>?</u></b></big></summary>

<a id="what-is-weak-iteration"></a>

I coined the term "weak iteration" <sup> _(at least, I think I did)_</sup> to
describe the concept of inspecting, iterating, and/or serializing entries of
[`WeakMap`] and [`WeakSet`] collections.

The concept of _"Weak Iteration"_ is not one that exists natively in the
JavaScript language. The `WeakMap` and `WeakSet` collections are intended to be
**opaque** and **non-introspectable**, which is precisely why they work so well
for storing private metadata, or associating data that only matters as long as a
particular object is still usable, without running the risk of leaks.

However, many developers (including yours truly) have found that a use cas does
exist for having another, iterable version of these weak collections. And so,
drawing inspiration from the example in the [TC39 WeakRef Proposal], I created
this package in an attempt to bridge that gap.

</details>

<details><summary><big><b><u>How's it all work?</u></b></big></summary>

<a id="hows-it-all-work"></a>

To attempt to mitigate this unpredictability, this package utilizes these APIs:

- [x] [`WeakMap`]: stores weakly-held keys and their corresponding `WeakRef`
      objects, ensuring they are GC'd in a predictable manner.
- [x] [`WeakRef`]: weakly-held references to the original weak key. Stored in
      the internal `WeakMap` (along with the original value), as well as an
      internal `Set` (that we leverage to allow [weak iteration]).
- [x] [`FinalizationRegistry`]: for tracking individual object's lifecycles and
      GC state; allows us to remove stale entries as soon as they're GC'd.

#### Caveats

This concept of weak iteration is inherently non-deterministic. This is
primarily due to the complex and finicky nature of garbage collection as it is
implemented in most JavaScript runtimes.

While this package has shown itself to be stable and quite reliable in testing,
it is important to remember a garbage collector is basically a "black box". It
can behave in unexpected ways, and so it should be treated as if it will.

##### A Word of Caution

I highly recommend reading the [TC39 WeakRef Proposal] README. It contains a
well-written explanation of the garbage collection (GC), the pitfalls involved
in working with it, and also a helpful [word of warning][tc39-proposal-warning]
for users of packages like this.

</details>

<details><summary><b>Footnotes and References</b></summary><br>
<a id="footnotes-and-references"></a>

1. Values are considered "living" if they have not been garbage-collected, and
   any weak references to them resolve to a non-nullable WeakKey value.
2. `WeakKey` types are object-like values (objects, arrays, and functions), as
   well as _non_-registered symbols (a registered symbol is one that is created
   with `Symbol.for`). If your runtime is using a version older than ES2023,
   this is limited to `object` types, as support for `symbol` keys is a
   [more recent addition][tc39-proposal-symbols].
3. Garbage Collection (GC) is the process by which the JavaScript runtime
   reclaims memory that is no longer in use by the program. This is done
   automatically by the runtime, and is not something that can typically be
   controlled by the developer. V8 does provide an `--expose-gc` flag that
   exposes a global `gc()` function that manually triggers the GC; but that
   should only be used for testing and debugging.
4. While regular Map objects have no restrictions on the values you use for keys
   or values, WeakMap objects require that all keys either be objects (which
   includes functions, arrays, and other object-like values), or non-registered
   symbols (those not created via `Symbol.for`, supported in ES2023+). The same
   restrictions apply to the keys in the `IterableWeakMap` class.
5. The performance benefits of using a `WeakMap` over a `Map` are primarily
   related to memory management. Since the keys in a `WeakMap` are weakly held,
   they can be garbage-collected if there are no other references to them, which
   also means their associated values can be garbage-collected as well. This
   makes `WeakMap` objects ideal for storing private data or metadata that is
   only relevant as long as the related key is still in use.
6. See the [section on weak iteration](#what-is-weak-iteration) for more info.

</details>

> [!WARNING]
>
> While this package _can_ be used as a drop-in replacement for `WeakMap`, it's
> important to have discretion when using it. **Do not** use this package for
> any critical or privacy-sensitive data, as its design breaks the fundamental
> principles of the `WeakMap` API.
>
> Unlike its native counterpart, this package is inherently observable (that's
> the whole point of it), and so the data you store in it _can_ be exposed to
> the outside world. Its primary use case is for debugging and testing, not for
> production code or sensitive data.

---

<div align="center">

<big><b>**[MIT]** © **[Nicholas Berlette]**. All rights reserved.</b></big>

<small><strong>[GitHub] · [Issues] · [JSR] · [Deno]</strong></small>

<br>

[![][badge-jsr]][@iter]

</div>

<!-- links and resource references -->

[`IterableWeakMap`]: #iterableweakmap "Jump to symbol: 'IterableWeakMap'"
[MIT]: https://nick.mit-license.org/2023 "Copyright © 2023-2025 Nicholas Berlette. MIT License."
[Nicholas Berlette]: https://github.com/nberlette "Nicholas Berlette's GitHub Profile"
[Issues]: https://github.com/nberlette/iterable/issues/new?assignees=nberlette&labels=bug,weak-map&title=%5BIterableWeakMap%5D+ "Found a bug? Let's squash it!"
[GitHub]: https://github.com/nberlette/iterable/tree/main/packages/weak-map "View @iter/weak-map on GitHub"
[`@iter/weak-map`]: https://jsr.io/@iter/weak-map "View @iter/weak-map on jsr.io"
[@iter]: https://jsr.io/@iter "View all @iter/* packages on jsr.io"
[deno]: https://deno.land/x/iterable/weak-map.ts "View iterable/weak-map on deno.land/x"
[jsr]: https://jsr.io/@iter/weak-map/doc "View @iter/weak-map on jsr.io"
[bun]: https://bun.sh "Bun JavaScript Runtime, Bundler, and Package Manager"
[pnpm]: https://pnpm.io "PNPM Package Manager"
[yarn]: https://yarnpkg.com "Yarn Package Manager"
[tc39-proposal-warning]: https://github.com/tc39/proposal-weakrefs#another-note-of-caution "TC39 Proposal for WeakRefs: Another Note of Caution"
[tc39-proposal-symbols]: https://github.com/tc39/proposal-symbols-as-weak-map-keys "TC39 Proposal for Symbols as WeakKeys (Stage 3)"
[TC39 WeakRef Proposal]: https://github.com/tc39/proposal-weakrefs "TC39 Proposal for WeakRefs"
[`WeakMap`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap "MDN Web Docs: WeakMap"
[`WeakSet`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet "MDN Web Docs: WeakSet"
[`Map`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map "MDN Web Docs: Map"
[`WeakRef`]: https://github.com/tc39/proposal-weakrefs "TC39 Proposal for WeakRefs"
[`FinalizationRegistry`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry "MDN Web Docs: FinalizationRegistry"
[weak iteration]: #what-is-weak-iteration "Jump to 'What is Weak Iteration?'"
[ephemeral]: https://en.wikipedia.org/wiki/Ephemeron "Wikipedia: Ephemeron"
[badge-jsr]: https://jsr.io/badges/@iter?color=345&labelColor=&logoColor=yellow&style=flat "View @iter on jsr.io"
[badge-jsr-pkg]: https://jsr.io/badges/@iter/weak-map?color=345&labelColor=&logoColor=yellow&style=flat "View @iter/weak-map on jsr.io"
[badge-jsr-score]: https://jsr.io/badges/@iter/weak-map/score?color=345&labelColor=&logoColor=yellow&style=flat "@iter/weak-map's score on jsr.io"
