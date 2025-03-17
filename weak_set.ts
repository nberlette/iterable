/**
 * This module provides an `IterableWeakSet` implementation, featuring an API
 * that feels like a standard `Set`, without sacrificing the memory-efficient
 * behavior of its ephemeral native counterpart. It can be used as a drop-in
 * replacement for the standard `Set` and `WeakSet` APIs alike.
 *
 * @see https://jsr.io/@iter/weak-set/doc for more information.
 *
 * @module weak-set
 */
export * from "./packages/weak_set/mod.ts";

/**
 * The `IterableWeakSet` class is an iterable collection that operates using
 * weak references to its keys, and can be used as a drop-in replacement for
 * either the standard `Set` or `WeakSet`.
 *
 * It implements the entire `Set` API from the latest version of the ECMAScript
 * specification, including all of the new methods introduced by the [TC39 Set
 * Methods Proposal].
 *
 * [TC39 Set Methods Proposal]: https://github.com/tc39/proposal-set-methods
 *
 * @see https://jsr.io/@iter/weak-set/doc for more information.
 */
export { default } from "./packages/weak_set/mod.ts";
