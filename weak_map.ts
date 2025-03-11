/**
 * This module provides an iterable WeakMap implementation. It features an API
 * that feels like a standard `Map`, without sacrificing the memory-efficient
 * behavior of its ephemeral native counterpart.
 *
 * The public API is fully compatible with both the native `WeakMap` and `Map`
 * interfaces, allowing it to be used as a drop-in replacement for either
 * without any compiler errors or assignability issues.
 *
 * @see https://jsr.io/@iter/weak-map/doc for more information.
 */
export * from "./packages/weak_map/mod.ts";

export { default } from "./packages/weak_map/mod.ts";
