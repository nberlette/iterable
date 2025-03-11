#!/usr/bin/env -S deno test --v8-flags=--expose-gc --allow-all --no-check=remote

import { IterableWeakMap } from "./mod.ts";
import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { assert } from "@std/assert";

declare function gc(): void;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("IterableWeakMap: constructor and static methods", () => {
  it("should be a function", () => {
    expect(IterableWeakMap).toBeInstanceOf(Function);
  });
  it("should be named 'IterableWeakMap'", () => {
    expect(IterableWeakMap.name).toBe("IterableWeakMap");
  });
  it("should have an arity of 1", () => {
    expect(IterableWeakMap).toHaveLength(1);
  });
  it("should be a class", () => {
    expect(Function.prototype.toString.call(IterableWeakMap)).toMatch(
      /^class IterableWeakMap/,
    );
  });
  it("should have a prototype", () => {
    expect(IterableWeakMap.prototype).toBeInstanceOf(Object);
  });
  it("should have a constructor", () => {
    expect(IterableWeakMap.prototype.constructor).toBe(IterableWeakMap);
  });
});

describe("IterableWeakMap.groupBy: static method", () => {
  it("should be a function", () => {
    expect(
      IterableWeakMap.groupBy,
      "should be a function",
    ).toBeInstanceOf(Function);
    expect(
      IterableWeakMap.groupBy.name,
      "should be named 'groupBy'",
    ).toBe("groupBy");
    expect(
      IterableWeakMap.groupBy,
      "should have an arity of 2",
    ).toHaveLength(2);
  });
  it("should behave as expected", () => {
    const k1 = { id: 1 }, k2 = { id: 2 }, k3 = { id: 3 };
    const items = [
      [k1, "value1"],
      [k2, "value2"],
      [k3, "value3"],
      [k1, "value4"],
      [k1, "value5"],
      [k2, "value6"],
      [k3, "value7"],
      [k2, "value8"],
      [k3, "value9"],
    ] as const;

    const map = IterableWeakMap.groupBy(items, ([key]) => key);
    expect(map.size, "size should be 3").toBe(3);
    expect(map.get(k1), "k1 should have 3 values").toEqual([
      [k1, "value1"],
      [k1, "value4"],
      [k1, "value5"],
    ]);
    expect(map.get(k2), "k2 should have 4 values").toEqual([
      [k2, "value2"],
      [k2, "value6"],
      [k2, "value8"],
    ]);
    expect(map.get(k3), "k3 should have 3 values").toEqual([
      [k3, "value3"],
      [k3, "value7"],
      [k3, "value9"],
    ]);
    expect(
      map.get({ id: 4 }),
      "empty key should be undefined",
    ).toBeUndefined();
  });
});

describe("IterableWeakMap: prototype structural conformity", () => {
  const map = new IterableWeakMap<WeakKey, string>();
  expect(map).toBeInstanceOf(IterableWeakMap);

  const expectIt = (key: string) =>
    it(`should implement the '${key}' method`, () => {
      expect(
        map,
        "IterableWeakMap is missing the method " + key.toString(),
      ).toHaveProperty(key);
    });

  expectIt("get");
  expectIt("set");
  expectIt("has");
  expectIt("delete");
  expectIt("clear");
  expectIt("size");
  expectIt("entries");
  expectIt("keys");
  expectIt("values");
  expectIt("forEach");
  expectIt("toString");
});

describe("IterableWeakMap: behavior and functionality", () => {
  it("should create an empty map", () => {
    const map = new IterableWeakMap<WeakKey, string>();
    expect(map.size, "The map should be empty.").toBe(0);

    const key = {};
    expect(map.has(key), "The map should not have the key.").toBe(false);

    map.set(key, "value");
    expect(map.has(key), "The map should have the key.").toBe(true);

    expect(
      map.get(key),
      "The map should return the correct value.",
    ).toBe("value");

    expect(map.size, "The map should have size 1.").toBe(1);
    expect(map.get({}), "The map should return undefined for a new key.")
      .toBe(
        undefined,
      );
  });

  it("should support proper iteration", () => {
    const map = new IterableWeakMap<WeakKey, string>([
      [{}, "value1"],
      [{}, "value2"],
    ]);

    let size = 0;
    for (const [key, value] of map) {
      expect(key != null, "Key should not be null.").toBeTruthy();
      expect(typeof value, "Value should be a string.").toBe("string");
      size++;
    }

    expect(size, "Should iterate over 2 entries.").toBe(2);
  });

  it("should immediately reflect GC results (async)", async () => {
    const map = new IterableWeakMap<WeakKey, string>();
    let key = new Array(5e6).fill("*");
    map.set(key, "value");

    key = null!;
    await sleep(0);
    gc(); // Manually trigger garbage collection
    await sleep(4);
    expect(
      map.size,
      "The map should be empty after garbage collection.",
    ).toBe(0);
  });

  it("should properly delete and clear items", () => {
    const map = new IterableWeakMap<WeakKey, string>();
    const key1 = {}, key2 = {};

    map.set(key1, "value1").set(key2, "value2");
    expect(map.size, "The map should initially have 2 entries.").toBe(2);

    map.delete(key1);
    expect(map.has(key1), "The map should no longer have key1.").toBe(false);
    expect(map.size, "The map size should be 1 after deletion.").toBe(1);

    map.clear();
    expect(map.size, "The map should be empty after clearing.").toBe(0);
  });

  it("should throw on receipt of invalid keys", () => {
    const map = new IterableWeakMap<WeakKey, string>();

    expect(() => {
      // deno-lint-ignore no-explicit-any
      map.set("stringKey" as any, "value");
    }).toThrow(TypeError);
  });

  it("should overwrite values for repeated keys", () => {
    const map = new IterableWeakMap<WeakKey, string>();
    const key = {};

    map.set(key, "value1");
    map.set(key, "value2"); // Reuse the same key

    expect(
      map.get(key),
      "The map should update the value for a repeated key.",
    ).toBe("value2");
    expect(
      map.size,
      "The map size should remain 1 after updating a key's value.",
    ).toBe(1);
  });

  it("should iterate properly after GC (async)", async () => {
    const map = new IterableWeakMap<WeakKey, string>();
    let key1 = new Array(5e6).fill("*"); // Large object to encourage GC
    const key2 = {};

    map.set(key1, "value1");
    map.set(key2, "value2");

    key1 = null!; // Make key1 eligible for GC
    await sleep(0);
    gc(); // Trigger garbage collection
    await sleep(4);

    expect(map.size, "The map should have 1 entry after GC.").toBe(1);

    let count = 0;
    for (const [key, _value] of map) {
      assert(key != null, "Iterated key should not be null.");
      count++;
    }

    assert(
      count <= 2 && count >= 1,
      "The map should iterate over at least 1 and at most 2 entries after GC.",
    );
  });
});
