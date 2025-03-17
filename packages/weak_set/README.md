<div align="center">

<h1>

[`@iter/weak-set`]

</h1>

<big><b>An iterable alternative to the native WeakSet API.</b></big>

<small><b><i>Feels like a standard `Set`, bur performs like an ephemeral
`WeakSet`.</i></b></small>

[![][badge-jsr-pkg]][jsr] [![][badge-jsr-score]][jsr]

</div>

---

The [`IterableWeakSet`] class provided by this package is a drop-in replacement
for the native [`WeakSet`] API, that is capable of iterating over its entries.
Its API surface looks and feels nearly identical to that of a standard `Set`,
even implementing the entire [`TC39 Set Methods Proposal`] interface (ES2024),
all without sacrificing the ephemeral nature of its native `WeakSet`
counterpart.

## Install

The package is published on **[JSR]** as **[`@iter/weak-set`]**.

[<img align="left" src="https://api.iconify.design/simple-icons:deno.svg?height=40&width=40&color=%23ccc&inline=true" alt="Deno" />][deno]

```sh
deno add jsr:@iter/weak-set
```

[<img align="right" src="https://jsr.io/logo-square.svg?style=flat" width="48" height="44" alt="JSR" />][jsr]

```sh
jsr add @iter/weak-set
```

[<img align="left" src="https://api.iconify.design/logos:npm.svg?height=3.1rem&width=3rem&inline=true" alt="NPM" />][NPM]

```sh
npx jsr add @iter/weak-set
```

[<img align="right" src="https://api.iconify.design/logos:bun.svg?height=3rem&width=3rem&inline=true" alt="Bun" />][bun]

```sh
bunx jsr add @iter/weak-set
```

[<img align="left" src="https://api.iconify.design/logos:pnpm.svg?height=44&width=44&inline=true" alt="PNPM" />][pnpm]

```sh
pnpx jsr add @iter/weak-set
```

[<img align="right" src="https://api.iconify.design/logos:yarn.svg?height=44&width=44&inline=true" alt="Yarn" />][yarn]

```sh
yarn dlx jsr add @iter/weak-set
```

---

## API

<details open><summary><b><u>Table of Contents</u></b></summary><br>

- <big>**[`IterableWeakSet`]**</big>
  - [`size`](#size)
  - [`add`](#add)
  - [`clear`](#clear)
  - [`delete`](#delete)
  - [`has`](#has)
  - [`union`](#union)
  - [`intersection`](#intersection)
  - [`difference`](#difference)
  - [`symmetricDifference`](#symmetricdifference)
  - [`isSubsetOf`](#issubsetof)
  - [`isSupersetOf`](#issupersetof)
  - [`isDisjointFrom`](#isdisjointfrom)
  - [`forEach`](#foreach)
  - [`keys`](#keys)
  - [`values`](#values)
  - [`entries`](#entries)
  - [`[Symbol.iterator]`](#symboliterator)
- [Further Reading](#further-reading)

</details>

---

## `IterableWeakSet` <img align="left" src="https://img.shields.io/badge/class-lightgreen.svg?style=flat" style="margin-top:3px" alt="class" />

> **Implements**: [`Set<T>`], [`WeakSet<T>`], [`Iterable<T>`]

[`WeakSet<T>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet "MDN Web Docs: WeakSet"
[`Iterable<T>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols "MDN Web Docs: Iteration Protocols"
[`Set<T>`]: https://github.com/tc39/proposal-set-methods "TC39 Set Methods Proposal: Set Methods"

### Constructor

Creates a new `IterableWeakSet`, optionally initializing it with the values in
an iterable of `WeakKey`[^2] values.

```ts
import { IterableWeakSet } from "@iter/weak-set";

const set = new IterableWeakSet([{ k: 1 }, { k: 2 }]);
```

---

### `size` <img align="left" src="https://img.shields.io/badge/readonly-e74.svg?style=flat" style="margin-top:3px" alt="Readonly" />

```ts ignore
get size(): number;
```

#### Returns

The number of
<cite title="Living values are weakly-held values that have not been garbage collected are are available for usage. This usually implies 1 or more strong references to such a value are currently in existence.">living
values</cite>[^1] in the set.

---

### `add` <img align="left" src="https://img.shields.io/badge/method-57f.svg?style=flat" style="margin-top:3px" alt="method" />

```ts ignore
add(value: T): this;
```

Adds a `WeakKey`[^2] value to the set.

#### Parameters

| Name        | Info                         |
| :---------- | :--------------------------- |
| **`value`** | The value to add to the set. |

#### Returns

A reference to the [`IterableWeakSet`] instance, for easy chaining of additional
method calls.

#### Examples

```ts
import { IterableWeakSet } from "@iter/weak-set";

const set = new IterableWeakSet([{ k: 1 }]);

set.add({ k: 2 });

set.size; // => 2
```

```ts
import { IterableWeakSet } from "@iter/weak-set";

// since this method returns `this`, it affords us with some syntactic sugar.
// it's trivial to add multiple values at once, with little-to-no boilerplate:
const set = new IterableWeakSet().add({ k: 1 }).add({ k: 2 });
console.log(set.size); // => 2

// or, if you prefer a more functional approach:
console.log([
  set.size,
  set.add({ k: 3 }).delete([...set][0]) && set.size,
  set.add(Symbol.iterator).add(Symbol.toStringTag).size,
]);
```

---

### `clear` <img align="left" src="https://img.shields.io/badge/method-57f.svg?style=flat" style="margin-top:3px" alt="method" />

```ts ignore
clear(): void;
```

Clear all values from the set.

#### Example

```ts
import { IterableWeakSet } from "@iter/weak-set";

const set = new IterableWeakSet([{ k: 1 }, { k: 2 }]);

set.size; // => 2
set.clear();
set.size; // => 0
```

---

### `delete` <img align="left" src="https://img.shields.io/badge/method-57f.svg?style=flat" style="margin-top:3px" alt="method" />

```ts ignore
delete(value: T): boolean;
```

Deletes a value from the set, and returns a boolean indicating whether or not
the operation was completed successfully.

#### Parameters

| Name        | Info                             |
| :---------- | :------------------------------- |
| **`value`** | The weakly-held value to delete. |

#### Returns

- `true` if value was deleted successfully.
- `false` if it didn't exist in the set (or otherwise was not deleted).

#### Example

```ts
import { IterableWeakSet } from "@iter/weak-set";

const obj1 = { k: 1 };

const set = new IterableWeakSet([obj1]);

set.delete(obj1); // => true
set.delete(obj1); // => false
```

---

### `has` <img align="left" src="https://img.shields.io/badge/method-57f.svg?style=flat" style="margin-top:3px" alt="method" />

```ts ignore
has(value: T): boolean;
```

Check if a given `WeakKey` exists in the set.

#### Parameters

| Name        | Info                        |
| :---------- | :-------------------------- |
| **`value`** | The `WeakKey` to check for. |

#### Returns

- `true` if the value is a valid `WeakKey` and is in the current set.
- `false` if it does not exist in the set, or is not a valid `WeakKey`.

#### Example

```ts
import { IterableWeakSet } from "@iter/weak-set";

const obj1 = { k: 1 };

const set = new IterableWeakSet();
set.has(obj1); // => false
set.add(obj1); // add the object to the set
set.has(obj1); // => true
```

---

### `union` [<img align="left" src="https://img.shields.io/badge/ES2024-F7DF1E.svg?style=flat" style="margin-top:3px" alt="Part of the TC39 Proposal for Set Methods" />][`TC39 Set Methods Proposal`]

```ts ignore
union<U extends WeakKey>(other: ReadonlySetLike<U>): IterableWeakSet<T | U>;
```

Creates a union [`IterableWeakSet`], containing all the values from the current
set, as well as the `other` set. This is effectively a logical `OR` operation on
the two sets.

> This method **does _not_** modify either set - they both remain unchanged.

#### Parameters

| Name        | Info                                   |
| :---------- | :------------------------------------- |
| **`other`** | The set to merge with the current set. |

#### Returns

A new [`IterableWeakSet`] instance containing the merged values.

#### Examples

```ts
import { IterableWeakSet } from "@iter/weak-set";

const obj1 = { k: 1 }, obj2 = { k: 2 };
const set1 = new IterableWeakSet([obj1]);
const set2 = new IterableWeakSet([obj2]);

const union = set1.union(set2);
console.log(union); // => IterableWeakSet (2) { { k: 1 }, { k: 2 } }
```

```ts
import { IterableWeakSet } from "@iter/weak-set";

const obj1 = { k: 1 }, obj2 = { k: 2 }, obj3 = { k: 3 };

const set1 = new IterableWeakSet([obj1]);
const set2 = new Set([obj2, obj3]);

const union = set1.union(set2);
//    ^? const union: IterableWeakSet<{ key: number }>

console.log(union);
// IterableWeakSet (3) { { k: 1 }, { k: 2 }, { k: 3 } }
```

> See [`union`] from the [`TC39 Set Methods Proposal`].

---

### `intersection` [<img align="left" src="https://img.shields.io/badge/ES2024-F7DF1E.svg?style=flat" style="margin-top:3px" alt="Part of the TC39 Proposal for Set Methods" />][`TC39 Set Methods Proposal`]

```ts ignore
intersection<U extends WeakKey>(other: ReadonlySetLike<U>): IterableWeakSet<T & U>;
```

Returns a new [`IterableWeakSet`] instance with only the values of the current
set that are **also present in the `other` set**.

> This method does not modify either set - they both remain unchanged.

#### Parameters

| Name        | Info                                     |
| :---------- | :--------------------------------------- |
| **`other`** | The set to compare with the current set. |

#### Returns

A new [`IterableWeakSet`] instance containing the intersection values.

#### Example

```ts
import { IterableWeakSet } from "@iter/weak-set";

const a = { k: "a" }, b = { k: "b" }, c = { k: "c" };
const set1 = new IterableWeakSet([a, b]);
const set2 = new IterableWeakSet([b, c]);

const intersection = set1.intersection(set2);
console.log(intersection); // => IterableWeakSet (1) { { k: "b" } }
```

> See [`intersection`] from the [`TC39 Set Methods Proposal`].

---

### `difference` [<img align="left" src="https://img.shields.io/badge/ES2024-F7DF1E.svg?style=flat" style="margin-top:3px" alt="Part of the TC39 Proposal for Set Methods" />][`TC39 Set Methods Proposal`]

```ts ignore
difference<U extends WeakKey>(other: ReadonlySetLike<U>): IterableWeakSet<T>;
```

Returns a new [`IterableWeakSet`] instance, containing only the values of the
current set that are **not** also present in the `other` set.

> This method **does _not_** modify either set - they both remain unchanged.

#### Parameters

| Name        | Info                                     |
| :---------- | :--------------------------------------- |
| **`other`** | The set to compare with the current set. |

#### Returns

A new [`IterableWeakSet`] instance containing the difference values.

#### Example

```ts
import { IterableWeakSet } from "@iter/weak-set";

const a = { k: 1 }, b = { k: 2 }, c = { k: 3 };
const set1 = new IterableWeakSet([a, b]);
const set2 = new IterableWeakSet([b]);

const difference = set1.difference(set2);
console.log(difference); // => IterableWeakSet (1) { { k: 1 } }
```

> See [`difference`] from the [`TC39 Set Methods Proposal`].

---

### `symmetricDifference` [<img align="left" src="https://img.shields.io/badge/ES2024-F7DF1E.svg?style=flat" style="margin-top:3px" alt="Part of the TC39 Proposal for Set Methods" />][`TC39 Set Methods Proposal`]

```ts ignore
symmetricDifference<U extends WeakKey>(other: ReadonlySetLike<U>): IterableWeakSet<T | U>;
```

Creates new [`IterableWeakSet`] with the values that are either in the current
set or the `other` set, but **not in both**. Effectively performs a logical
`XOR` (exclusive-OR) operation on the two sets.

> This method **does _not_** modify either set - they both remain unchanged.

#### Parameters

| Name        | Info                                     |
| :---------- | :--------------------------------------- |
| **`other`** | The set to compare with the current set. |

#### Returns

A new [`IterableWeakSet`] instance containing the symmetric difference values.

#### Example

```ts
import { IterableWeakSet } from "@iter/weak-set";

const a = { k: 1 }, b = { k: 2 }, c = { k: 3 };
const set1 = new IterableWeakSet([a, b]);
const set2 = new IterableWeakSet([b, c]);

const symmetricDifference = set1.symmetricDifference(set2);
console.log(symmetricDifference); // => IterableWeakSet (2) { { k: 1 }, { k: 3 } }
```

> See [`symmetricDifference`] from the [`TC39 Set Methods Proposal`].

---

### `isSubsetOf` [<img align="left" src="https://img.shields.io/badge/ES2024-F7DF1E.svg?style=flat" style="margin-top:3px" alt="Part of the TC39 Proposal for Set Methods" />][`TC39 Set Methods Proposal`]

```ts ignore
isSubsetOf<U extends WeakKey>(other: ReadonlySetLike<U>): boolean;
```

Checks if this is a **subset** of the `other` set-like object, which means all
of the values in the current set are also present in the `other` set. There may
also be additional values in the `other` set that are not in the current set.

> This operation is the inverse of the [`isSupersetOf`](#issupersetof) method,
> so calling `a.isSubsetOf(b)` is equivalent to calling `b.isSupersetOf(a)`.

#### Parameters

| Name        | Info                                     |
| :---------- | :--------------------------------------- |
| **`other`** | The set to compare with the current set. |

#### Returns

- `true` if the current set is a **subset** of the `other` set.
- `false` if it is not.

> [!NOTE]
>
> Subsets may have additional values **not** shared by the `other` set. So long
> as it contains **all** the values of `other` (its "super set"), it is
> considered a valid subset of `other`.

#### Example

```ts
import { IterableWeakSet } from "@iter/weak-set";

const a = { k: 1 }, b = { k: 2 }, c = { k: 3 };

const set1 = new IterableWeakSet([a, b]);
const set2 = new IterableWeakSet([a, b, c]);
const set3 = new IterableWeakSet([b, c]);

// set1 (a, b) and set3 (b, c) are subsets of set2 (a, b, c):
set1.isSubsetOf(set2); // true
set3.isSubsetOf(set2); // true

// this means the inverse must also be true:
set2.isSupersetOf(set1); // true
set2.isSupersetOf(set3); // true

// however, neither set1 and set3 are not subsets of one another:
set1.isSubsetOf(set3); // => false
set3.isSubsetOf(set1); // => false
```

> See [`isSubsetOf`] from the [`TC39 Set Methods Proposal`].

---

### `isSupersetOf` [<img align="left" src="https://img.shields.io/badge/ES2024-F7DF1E.svg?style=flat" style="margin-top:3px" alt="Part of the TC39 Proposal for Set Methods" />][`TC39 Set Methods Proposal`]

```ts ignore
isSupersetOf<U extends WeakKey>(other: ReadonlySetLike<U>): boolean;
```

Checks if the current set is a **superset** of an `other` set-like object. The
term **_superset_** is defined as a set that contains **all** of the values of
its **_subset_**.

This operation is the inverse of the [`isSubsetOf`](#issubsetof) method, so
`a.isSupersetOf(b)` is equivalent to calling `b.isSubsetOf(a)`.

#### Parameters

| Name        | Info                                     |
| :---------- | :--------------------------------------- |
| **`other`** | The set to compare with the current set. |

#### Returns

- `true` if the current set is a **superset** of the provided set.
- `false` if it is not.

> [!NOTE]
>
> A subset may also have additional values that are **not** shared by the
> current (super) set. As long as all of the values in the current set also
> exist in the `other` set, it is still considered to be a superset of `other`.

#### Example

```ts
import { IterableWeakSet } from "@iter/weak-set";

const a = { k: 1 }, b = { k: 2 }, c = { k: 3 };
const set1 = new IterableWeakSet([a, b, c]);
const set2 = new IterableWeakSet([a, b]);

set1.isSupersetOf(set2); // => true
```

> See [`isSupersetOf`] from the [`TC39 Set Methods Proposal`].

---

### `isDisjointFrom` [<img align="left" src="https://img.shields.io/badge/ES2024-F7DF1E.svg?style=flat" style="margin-top:3px" alt="Part of the TC39 Proposal for Set Methods" />][`TC39 Set Methods Proposal`]

```ts ignore
isDisjointFrom<U extends WeakKey>(other: ReadonlySetLike<U>): boolean;
```

Checks if the current set is **_disjoint_** from the `other` set, which means
there are **no elements** in common (shared) between the two sets. This means
that both the [`isSubsetOf`](#issubsetof) and [`isSupersetOf`](#issupersetof)
methods would return `false`.

#### Parameters

| Name        | Info                                     |
| :---------- | :--------------------------------------- |
| **`other`** | The set to compare with the current set. |

#### Returns

`true` if the current set is disjoint from the provided set; otherwise `false`.

#### Example

```ts
import { IterableWeakSet } from "@iter/weak-set";

const a = { k: 1 }, b = { k: 2 }, c = { k: 3 };
const set1 = new IterableWeakSet([a, b]);
const set2 = new IterableWeakSet([c]);

set1.isDisjointFrom(set2); // => true
```

> See [`isDisjointFrom`] from the [`TC39 Set Methods Proposal`].

---

### `forEach` <img align="left" src="https://img.shields.io/badge/method-57f.svg?style=flat" style="margin-top:3px" alt="method" />

```ts ignore
forEach(
  callback: (value: T, value2: T, set: IterableWeakSet<T>) => void,
  thisArg?: unknown,
): void;
```

Iterates over each item in the set, and invokes the callback function with the
`key` (which is just `value` in this case), `value`, and `set` as arguments.

#### Parameters

| Name           | Info                                                                                  |
| :------------- | :------------------------------------------------------------------------------------ |
| **`callback`** | The callback function to invoke for each value in the set.                            |
| **`thisArg`**  | The contextual `this` binding inside the `callback` function <sup> _(optional)_</sup> |

#### Example

```ts
import { IterableWeakSet } from "@iter/weak-set";

const obj1 = { k: 1 }, obj2 = { k: 2 };
const set = new IterableWeakSet([obj1, obj2]);

set.forEach((value, value2, set) => {
  console.log(value, value2, set);
});
```

---

### `keys` <img align="left" src="https://img.shields.io/badge/generator-f060a0.svg?style=flat" style="margin-top:3px" alt="generator" />

```ts ignore
*keys(): IterableIterator<T>;
```

#### Returns

An iterable iterator for all keys in the set.

#### Example

```ts
import { IterableWeakSet } from "@iter/weak-set";

const obj1 = { k: 1 }, obj2 = { k: 2 };
const set = new IterableWeakSet([obj1, obj2]);

for (const key of set.keys()) console.log(key);

// or using the spread operator:
const keys1 = [...set.keys()];
```

---

### `values` <img align="left" src="https://img.shields.io/badge/generator-f060a0.svg?style=flat" style="margin-top:3px" alt="generator" />

```ts ignore
*values(): IterableIterator<T>;
```

#### Returns

An iterable iterator for all values in the set.

#### Example

```ts
import { IterableWeakSet } from "@iter/weak-set";

const obj1 = { k: 1 }, obj2 = { k: 2 };
const set = new IterableWeakSet([obj1, obj2]);

for (const value of set.values()) console.log(value);

// or using the spread operator:
const values1 = [...set.values()];
```

---

### `entries` <img align="left" src="https://img.shields.io/badge/generator-f060a0.svg?style=flat" style="margin-top:3px" alt="generator" />

```ts ignore
*entries(): IterableIterator<[T, T]>;
```

#### Returns

An iterator over all key-value pairs (entries) in the set.

#### Example

```ts
import { IterableWeakSet } from "@iter/weak-set";

const obj1 = { k: 1 }, obj2 = { k: 2 };
const set = new IterableWeakSet([obj1, obj2]);

for (const [key, value] of set.entries()) console.log(key, value);

// or using the spread operator:
const entries1 = [...set.entries()];
```

---

### `[Symbol.iterator]` <img align="left" src="https://img.shields.io/badge/generator-f060a0.svg?style=flat" style="margin-top:3px" alt="generator" />

```ts ignore
*[Symbol.iterator](): IterableIterator<T>;
```

This is an alias for [`IterableWeakSet.prototype.values`](#values).

#### Returns

An iterator over all values in the set.

#### Example

```ts
import { IterableWeakSet } from "@iter/weak-set";

const obj1 = { k: 1 }, obj2 = { k: 2 };
const set = new IterableWeakSet([obj1, obj2]);

for (const value of set) console.log(value);

// or using the spread operator:
const values1 = [...set];

// or using the `Array.from` method:
const values2 = Array.from(set);
```

---

## Further Reading

<details><summary><big><b>⚠️ <u>Important differences</u> between this and <code>WeakSet</code></b></big></summary>

<br>

It is important to note that this class is _not_ a subclass of the native
`WeakSet`. In fact, from an inheritance standpoint, they are completely
unrelated to one another; as such, this API **will not** pass any `instanceof`
checks or other type guards that check for the native `WeakSet` type.

##### Wait, I thought you said it was a drop-in replacement?

This package is designed to be a drop-in replacement only in terms of behavior
and functionality. This is a standalone class that uses several advanced native
APIs to provide an experience that feels and behaves quite like a standard Set,
while maintaining the same [ephemeral] nature of a `WeakSet` underneath.

> If you need something that can pass the Pepsi Challenge with the native
> `WeakSet` API, well, you should probably just use the native `WeakSet`.
>
>     ¯\_(ツ)_/¯

See the section on [weak iteration](#what-is-weak-iteration) and
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
engine in JavaScript runtimes, and not a problem unique to [`IterableWeakSet`].

</details>

<details><summary><big><b><u>What is <i>"Weak Iteration"</i>?</u></b></big></summary>

<a id="what-is-weak-iteration"></a>

I coined the term "weak iteration" <sup> _(at least, I think I did)_</sup> to
describe the concept of inspecting, iterating, and/or serializing entries of
[`WeakSet`] collections.

The concept of _"Weak Iteration"_ is not one that exists natively in the
JavaScript language. The `WeakSet` collection is intended to be **opaque** and
**non-introspectable**, which is precisely why it works so well for tracking
objects without preventing their garbage collection.

However, many developers (including yours truly) have found that a use case does
exist for having another, iterable version of these weak collections. And so,
drawing inspiration from the example in the [TC39 WeakRef Proposal], I created
this package in an attempt to bridge that gap.

</details>

<details><summary><big><b><u>How's it all work?</u></b></big></summary>

<a id="hows-it-all-work"></a>

To attempt to mitigate this unpredictability, this package utilizes these APIs:

- [x] [`WeakMap`]: stores weakly-held values and their corresponding `WeakRef`
      objects, ensuring they are GC'd in a predictable manner.
- [x] [`WeakRef`]: weakly-held references to the original value. These are
      stored in the internal `WeakMap` (along with any additional metadata), as
      well as in an internal `Set` that we leverage to allow [weak iteration].
- [x] [`FinalizationRegistry`]: for tracking individual objects' lifecycles and
      GC state; this allows us to remove stale entries as soon as they're GC'd.

#### Caveats

This concept of weak iteration is inherently non-deterministic. This is
primarily due to the complex and finicky nature of garbage collection as it is
implemented in most JavaScript runtimes.

While this package has shown itself to be stable and quite reliable in testing,
it is important to remember that a garbage collector is basically a "black box."
It can behave in unexpected ways, and so it should be treated as such.

##### A Word of Caution

I highly recommend reading the [TC39 WeakRef Proposal] README. It contains a
well-written explanation of garbage collection (GC), the pitfalls involved in
working with it, and also a helpful [word of warning][tc39-proposal-warning] for
users of packages like this.

</details>

<details><summary><b>Footnotes and References</b></summary><br>
<a id="footnotes-and-references"></a>

1. Values are considered "living" if they have not been garbage-collected, and
   any weak references to them resolve to a non-null value.
2. `WeakSet` values must be object-like (objects, arrays, and functions), as
   well as _non_-registered symbols (a registered symbol is one that is created
   with `Symbol.for`). If your runtime is using a version older than ES2023,
   this is limited to `object` types, as support for `symbol` values is a
   [more recent addition][tc39-proposal-symbols].
3. Garbage Collection (GC) is the process by which the JavaScript runtime
   reclaims memory that is no longer in use by the program. This is done
   automatically by the runtime, and is not something that can typically be
   controlled by the developer. V8 does provide an `--expose-gc` flag that
   exposes a global `gc()` function to manually trigger the GC; however, this
   should only be used for testing and debugging.
4. While regular Set objects have no restrictions on the values you use,
   `WeakSet` objects require that all values be objects (which includes
   functions, arrays, and other object-like values), or non-registered symbols
   (those not created via `Symbol.for`, supported in ES2023+). The same
   restrictions apply to the values in the `IterableWeakSet` class.
5. The performance benefits of using a `WeakSet` over a `Set` are primarily
   related to memory management. Since the values in a `WeakSet` are weakly
   held, they can be garbage-collected if there are no other references to them,
   which also means any associated metadata can be garbage-collected as well.
   This makes `WeakSet` objects ideal for tracking objects that should not
   prevent their own cleanup.
6. See the [section on weak iteration](#what-is-weak-iteration) for more info.

</details>

> [!WARNING]
>
> While this package _can_ be used as a drop-in replacement for `WeakSet`, it's
> important to exercise discretion when using it. **Do not** use this package
> for any critical or privacy-sensitive data, as its design breaks the
> fundamental principles of the `WeakSet` API.
>
> Unlike its native counterpart, this package is inherently observable (which is
> the whole point of it), and so the data you store in it _can_ be exposed to
> the outside world. Its primary use case is for debugging and testing, not for
> production code or sensitive data.

---

<div align="center">

**[MIT]** © **[Nicholas Berlette]**. All rights reserved.

**[GitHub] · [Issues] · [JSR] · [NPM] · [Deno]**

<br>

[![][badge-jsr]][@iter]

</div>

<!-- footnotes and references -->

[^1]: Values are considered "living" if they have not been garbage-collected,
    and any weak references to them resolve to a non-nullable WeakKey value.

[^2]: `WeakKey` types are object-like values (objects, arrays, and functions),
    as well as _non_-registered symbols (a registered symbol is one that is
    created with `Symbol.for`). If your runtime is using a version older than
    ES2023, this is limited to `object` types, as support for `symbol` keys is a
    [more recent addition][tc39-proposal-symbols].

[^3]: Garbage Collection (GC) is the process by which the JavaScript runtime
    reclaims memory that is no longer in use by the program. This is done
    automatically by the runtime, and is not something that can typically be
    controlled by the developer. V8 provides an `--expose-gc` flag, which
    enables a global `gc()` function to manually trigger GC, however that should
    only be used for testing and debugging.

[^4]: For example, the [JSDOM] team uses a similar (but less feature-rich) API
    for their internal management of DOM elements and node references.

[^5]: This type parameter has no default, which means it **_must_** be specified
    when referencing the `IterableWeakSet` type in a generic type-level context.
    It does _not_ need to be specified when creating an instance of the class
    itself.

<!-- links and resource references -->

[`IterableWeakSet`]: #iterableweakset "Jump to symbol: 'IterableWeakSet'"
[MIT]: https://nick.mit-license.org "Copyright © 2023-2024 Nicholas Berlette. MIT License."
[Nicholas Berlette]: https://github.com/nberlette "Nicholas Berlette's GitHub Profile"
[Issues]: https://github.com/nberlette/iterable/issues/new?assignees=nberlette&labels=IterableWeakSet&template=iterableweak-set.md&title=%5BIterableWeakSet%5D+ "Found a bug? Let's squash it!"
[GitHub]: https://github.com/nberlette/iterable "Repository on GitHub"
[tc39-proposal-warning]: https://github.com/tc39/proposal-weakrefs#another-note-of-caution "TC39 Proposal for WeakRefs: Another Note of Caution"
[tc39-proposal-symbols]: https://github.com/tc39/proposal-symbols-as-weakmap-keys "TC39 Proposal for Symbols as WeakKeys (Stage 3)"
[`TC39 Set Methods Proposal`]: https://github.com/tc39/proposal-set-methods "TC39 Proposal for Set Methods"
[TC39 WeakRef Proposal]: https://github.com/tc39/proposal-weakrefs "TC39 Proposal for WeakRefs"
[`@iter/weak-set`]: https://jsr.io/@iter/weak-set "View @iter/weak-set on jsr.io"
[deno]: https://deno.land/x/iterable/weak-set/mod.ts "View iterable/weak-set on deno.land/x"
[jsr]: https://jsr.io/@iter/weak-set "View @iter/weak-set on jsr.io"
[npm]: https://www.npmjs.com/package/@itter/weak-set "View @itter/weak-set on NPM"
[@iter]: https://jsr.io/@iter "View all @iter/* packages on jsr.io"
[badge-jsr]: https://jsr.io/badges/@iter "View all @iter/* packages on jsr.io"
[badge-jsr-pkg]: https://jsr.io/badges/@iter/weak-set?color=345&labelColor=&logoColor=yellow&style=flat "View @iter/weak-set on jsr.io"
[badge-jsr-score]: https://jsr.io/badges/@iter/weak-set/score?color=345&labelColor=&logoColor=yellow&style=flat "@iter/weak-set's score on jsr.io"
[`WeakMap`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap "MDN Web Docs: WeakMap"
[`WeakSet`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet "MDN Web Docs: WeakSet"
[`Iterable`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols "MDN Web Docs: Iteration Protocols"
[`WeakRef`]: https://github.com/tc39/proposal-weakrefs "TC39 Proposal for WeakRefs"
[`FinalizationRegistry`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry "MDN Web Docs: FinalizationRegistry"
[`union`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/union "MDN Web Docs: Set.prototype.union"
[`intersection`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/intersection "MDN Web Docs: Set.prototype.intersection"
[`difference`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/difference "MDN Web Docs: Set.prototype.difference"
[`symmetricDifference`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/symmetricDifference "MDN Web Docs: Set.prototype.symmetricDifference"
[`isSubsetOf`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/isSubsetOf "MDN Web Docs: Set.prototype.isSubsetOf"
[`isSupersetOf`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/isSupersetOf "MDN Web Docs: Set.prototype.isSupersetOf"
[`isDisjointFrom`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/isDisjointFrom "MDN Web Docs: Set.prototype.isDisjointFrom"
[JSDOM]: https://github.com/jsdom/jsdom "JSDOM: A JavaScript implementation of the DOM and HTML standards"
[bun]: https://bun.sh "Bun JavaScript Runtime, Bundler, and Package Manager"
[pnpm]: https://pnpm.io "PNPM Package Manager"
[yarn]: https://yarnpkg.com "Yarn Package Manager"
