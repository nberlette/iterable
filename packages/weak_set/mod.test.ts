#!/usr/bin/env -S deno run --v8-flags=--expose-gc --allow-all --no-check

import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { IterableWeakSet } from "@iter/weak-set";

declare function gc(): void;

if (typeof gc !== "function") {
  // force the test run to have a GC function if we forgot to pass the flag
  const p = new Deno.Command(Deno.execPath(), {
    args: ["test", "--v8-flags=--expose-gc", ...Deno.args],
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  }).spawn();
  p.ref();
  const { code } = await p.status;
  p.unref();
  Deno.exit(code);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("IterableWeakSet", () => {
  it("should implement the core Set-like API ('size', 'has', 'keys')", () => {
    const set = new IterableWeakSet();
    expect(set).toBeInstanceOf(IterableWeakSet);

    const expectIt = expect(
      set,
      "IterableWeakSet does not implement all of the necessary members of the Set-like interface! Expected it to implement 'has', 'keys' and 'size' at a bare minimum.",
    );
    expectIt.toHaveProperty("has");
    expectIt.toHaveProperty("size");
    expectIt.toHaveProperty("keys");
  });

  it("has the same structure as a standard ES Set (pre-es2023)", () => {
    const set = new IterableWeakSet();
    expect(set).toBeInstanceOf(IterableWeakSet);

    const expectIt = expect(
      set,
      "IterableWeakSet does not implement all of the necessary members of the pre-proposal Set interface! (add, has, delete, clear, size, forEach, entries, keys, values, Symbol.iterator)",
    );
    expectIt.toHaveProperty("add");
    expect(typeof set.add, "set.add is not a function").toBe("function");
    expectIt.toHaveProperty("has");
    expect(typeof set.has, "set.has is not a function").toBe("function");
    expectIt.toHaveProperty("delete");
    expect(typeof set.delete, "set.delete is not a function").toBe("function");
    expectIt.toHaveProperty("clear");
    expect(typeof set.clear, "set.clear is not a function").toBe("function");
    expectIt.toHaveProperty("size");
    expect(typeof set.size, "set.size is not a number").toBe("number");
    expectIt.toHaveProperty("forEach");
    expect(typeof set.forEach, "set.forEach is not a function").toBe(
      "function",
    );
    expectIt.toHaveProperty("entries");
    expect(typeof set.entries, "set.entries is not a function").toBe(
      "function",
    );
    expectIt.toHaveProperty("keys");
    expect(typeof set.keys, "set.keys is not a function").toBe("function");
    expectIt.toHaveProperty("values");
    expect(typeof set.values, "set.values is not a function").toBe("function");
    expect(
      Symbol.iterator in set && typeof set[Symbol.iterator] === "function",
      "set does not implement the Iterable protocol",
    );
  });

  it("implements the TC39 Proposal for Set Methods", () => {
    const set = new IterableWeakSet();
    expect(set).toBeInstanceOf(IterableWeakSet);

    const expectIt = expect(
      set,
      "IterableWeakSet does not implement all of the members of the TC39 Set Methods Proposal! Expected it to implement 'union', 'intersection', 'difference', 'symmetricDifference', 'isSupersetOf', 'isSubsetOf' and 'isDisjointFrom'.",
    );
    expectIt.toHaveProperty("union");
    expect(typeof set.union, "set.union is not a function").toBe("function");
    expectIt.toHaveProperty("intersection");
    expect(typeof set.intersection, "set.intersection is not a function").toBe(
      "function",
    );
    expectIt.toHaveProperty("difference");
    expect(typeof set.difference, "set.difference is not a function").toBe(
      "function",
    );
    expectIt.toHaveProperty("symmetricDifference");
    expect(
      typeof set.symmetricDifference,
      "set.symmetricDifference is not a function",
    ).toBe("function");
    expectIt.toHaveProperty("isSupersetOf");
    expect(typeof set.isSupersetOf, "set.isSupersetOf is not a function").toBe(
      "function",
    );
    expectIt.toHaveProperty("isSubsetOf");
    expect(typeof set.isSubsetOf, "set.isSubsetOf is not a function").toBe(
      "function",
    );
    expectIt.toHaveProperty("isDisjointFrom");
    expect(typeof set.isDisjointFrom, "set.isDisjointFrom is not a function")
      .toBe("function");
  });

  it("IterableWeakSet basic functionality", () => {
    const set = new IterableWeakSet();
    const key = {};
    set.add(key);

    expect(set.has(key), "The set should have the key.").toEqual(true);
    expect([...set][0], "The set should have the key").toEqual(key);
    expect(set.size, "The set size should be 1.").toEqual(1);
    expect(set.delete(key), "The key should be deleted.").toEqual(true);
    expect(set.has(key), "The set should no longer have the key.").toEqual(
      false,
    );
    expect(set.size, "The set size should be 0.").toEqual(0);
  });

  it("IterableWeakSet iteration", () => {
    const set = new IterableWeakSet([{ key: 1 }, { key: 2 }, { key: 3 }]);

    let size = 0;
    for (const key of set) {
      expect(key != null, "Key should not be null.").toEqual(true);
      expect(
        "key" in key && key.key > 0,
        "Key should have a 'key' property.",
      ).toEqual(true);
      size++;
    }

    expect(set.size, "Size should match the number of entries.").toEqual(size);
    expect(size, "Should iterate over 3 entries.").toEqual(3);
  });

  it("should properly delete and clear items", () => {
    const set = new IterableWeakSet();
    const key1 = {}, key2 = {};

    set.add(key1).add(key2);
    expect(set.size, "The set should initially have 2 entries.").toEqual(2);

    set.delete(key1);
    expect(set.has(key1), "The set should no longer have key1.").toEqual(false);
    expect(set.size, "The set size should be 1 after deletion.").toEqual(1);

    set.clear();
    expect(set.size, "The set should be empty after clearing.").toEqual(0);
  });

  it("should throw on receipt of invalid keys", () => {
    const set = new IterableWeakSet();

    expect(
      () => set.add("stringKey" as unknown as object),
    ).toThrow(TypeError);
  });

  it("should overwrite values for repeated keys", () => {
    const set = new IterableWeakSet();
    const key = {};

    set.add(key).add(key); // Reuse the same key
    expect(set.size, "The set size should remain 1 for duplicate values.")
      .toEqual(1);
  });

  it("should iterate properly after GC", async () => {
    const set = new IterableWeakSet();
    let key1 = new Array(1e6).fill("*"); // Large object to encourage GC
    const key2 = {};

    set.add(key1);
    set.add(key2);

    key1 = null!; // Make key1 eligible for GC
    await sleep(0);

    gc(); // Trigger garbage collection
    await sleep(4);

    expect(set.size, "The set should have 1 entry after GC.").toEqual(1);

    let count = 0;
    for (const key of set) {
      expect(key === null, "Iterated key should not be null.").toEqual(false);
      count++;
    }

    expect(
      count <= 2 && count >= 1,
      "The set should iterate over at least 1 and at most 2 entries after GC.",
    ).toEqual(true);
  });
});

const a = { key: 1 },
  b = { key: 2 },
  c = { key: 3 },
  d = { key: 4 },
  e = { key: 5 },
  f = { key: 6 },
  g = { key: 7 },
  h = { key: 8 };

describe("IterableWeakSet.prototype.union", () => {
  it("should return a new set containing all elements from both sets", () => {
    const set1 = new IterableWeakSet([a, b, c, d, e]);
    const set2 = new IterableWeakSet([d, e, f, g, h]);

    const union = set1.union(set2);

    expect(union.size, "The union set should have 8 entries.").toEqual(8);
    expect([...union].length, "The union set should have 8 entries.").toEqual(
      8,
    );
    expect(union.has(a), "The union set should have key a (set1).").toBe(true);
    expect(union.has(e), "The union set should have key e (set2).").toBe(true);
  });

  it("should accept regular Set instances for the 'other' argument", () => {
    const set1 = new IterableWeakSet([a, b, c, d, e]);
    const set2 = new Set([d, e, f, g, h]);

    const union = set1.union(set2);

    expect(union.size, "The union set should have 8 entries.").toEqual(8);
    expect([...union].length, "The union set should have 8 entries.").toEqual(
      8,
    );
    expect(union.has(a), "The union set should have key a (set1).").toBe(true);
    expect(union.has(e), "The union set should have key e (set2).").toBe(true);
  });

  it("should accept set-like objects for the 'other' argument", () => {
    const set1 = new IterableWeakSet([a, b, c, d, e]);
    const set2 = new Map([[d, 1], [e, 2], [f, 3], [g, 4], [h, 5]]);

    const union = set1.union(set2 as never);

    expect(union.size, "The union set should have 8 entries.").toEqual(8);
    expect([...union].length, "The union set should have 8 entries.").toEqual(
      8,
    );
    expect(union.has(a), "The union set should have key a (set1).").toBe(true);
    expect(union.has(e), "The union set should have key e (set2).").toBe(true);
  });

  it.ignore("should throw if the 'other' argument is not a set-like object", () => {
    const set = new IterableWeakSet([a, b, c]);

    expect(() => set.union({} as never)).toThrow(TypeError);
  });

  it("should return a new set even if the 'other' set is empty", () => {
    const set1 = new IterableWeakSet([a, b, c]);
    const set2 = new IterableWeakSet();

    const union = set1.union(set2);

    expect(union.size, "The union set should have 3 entries (set1).").toEqual(
      3,
    );
    expect([...union].length, "The union set should have 3 entries (set1).")
      .toEqual(3);
    // Removed the stray assertNotEquals call.
  });
});

describe("IterableWeakSet.prototype.intersection", () => {
  it("should return a new set containing only elements that are in both sets", () => {
    const set1 = new IterableWeakSet([a, b, c, d, e]);
    const set2 = new IterableWeakSet([d, e, f, g, h]);

    const intersection = set1.intersection(set2);

    expect(intersection.size, "The intersection set should have 2 entries.")
      .toEqual(2);
    expect(
      [...intersection].length,
      "The intersection set should have 2 entries.",
    ).toEqual(2);
    expect(intersection.has(d), "The intersection set should have key d.").toBe(
      true,
    );
    expect(intersection.has(e), "The intersection set should have key e.").toBe(
      true,
    );
  });

  it("should accept regular Set instances for the 'other' argument", () => {
    const set1 = new IterableWeakSet([a, b, c, d, e]);
    const set2 = new Set([d, e, f, g, h]);

    const intersection = set1.intersection(set2);

    expect(intersection.size, "The intersection set should have 2 entries.")
      .toEqual(2);
    expect(
      [...intersection].length,
      "The intersection set should have 2 entries.",
    ).toEqual(2);
    expect(intersection.has(d), "The intersection set should have key d.").toBe(
      true,
    );
    expect(intersection.has(e), "The intersection set should have key e.").toBe(
      true,
    );
  });

  it("should accept set-like objects for the 'other' argument", () => {
    const set1 = new IterableWeakSet([a, b, c, d, e]);
    const set2 = new Map([[d, 1], [e, 2], [f, 3], [g, 4], [h, 5]]);

    const intersection = set1.intersection(set2 as never);

    expect(intersection.size, "The intersection set should have 2 entries.")
      .toEqual(2);
    expect(
      [...intersection].length,
      "The intersection set should have 2 entries.",
    ).toEqual(2);
    expect(intersection.has(d), "The intersection set should have key d.").toBe(
      true,
    );
    expect(intersection.has(e), "The intersection set should have key e.").toBe(
      true,
    );
  });

  it("should return an empty set if there are no common elements", () => {
    const set1 = new IterableWeakSet([a, b, c]);
    const set2 = new IterableWeakSet([d, e, f]);

    const intersection = set1.intersection(set2);

    expect(intersection.size, "The intersection set should have 0 entries.")
      .toEqual(0);
    expect(
      [...intersection].length,
      "The intersection set should have 0 entries.",
    ).toEqual(0);
  });

  it("should return an empty set if either set is empty", () => {
    const set1 = new IterableWeakSet([a, b, c]);
    const set2 = new IterableWeakSet();

    const intersection = set1.intersection(set2);

    expect(intersection.size, "The intersection set should have 0 entries.")
      .toEqual(0);
    expect(
      [...intersection].length,
      "The intersection set should have 0 entries.",
    ).toEqual(0);
  });

  it.ignore("should throw if the 'other' argument is not a set-like object", () => {
    const set = new IterableWeakSet([a, b, c]);

    expect(() => set.intersection({} as never)).toThrow(TypeError);
  });
});

describe("IterableWeakSet.prototype.difference", () => {
  it("should return a new set containing only elements that are in the first set", () => {
    const set1 = new IterableWeakSet([a, b, c, d, e]);
    const set2 = new IterableWeakSet([d, e, f, g, h]);

    const difference = set1.difference(set2);

    expect(difference.size, "The difference set should have 3 entries.")
      .toEqual(3);
    expect([...difference].length, "The difference set should have 3 entries.")
      .toEqual(3);
    expect(difference.has(a), "The difference set should have key a.").toBe(
      true,
    );
    expect(difference.has(b), "The difference set should have key b.").toBe(
      true,
    );
    expect(difference.has(c), "The difference set should have key c.").toBe(
      true,
    );
  });

  it("should accept regular Set instances for the 'other' argument", () => {
    const set1 = new IterableWeakSet([a, b, c, d, e]);
    const set2 = new Set([d, e, f, g, h]);

    const difference = set1.difference(set2);

    expect(difference.size, "The difference set should have 3 entries.")
      .toEqual(3);
    expect([...difference].length, "The difference set should have 3 entries.")
      .toEqual(3);
    expect(difference.has(a), "The difference set should have key a.").toBe(
      true,
    );
    expect(difference.has(b), "The difference set should have key b.").toBe(
      true,
    );
    expect(difference.has(c), "The difference set should have key c.").toBe(
      true,
    );
  });

  it("should accept set-like objects for the 'other' argument", () => {
    const set1 = new IterableWeakSet([a, b, c, d, e]);
    const set2 = new Map([[d, 1], [e, 2], [f, 3], [g, 4], [h, 5]]);

    const difference = set1.difference(set2 as never);

    expect(difference.size, "The difference set should have 3 entries.")
      .toEqual(3);
    expect([...difference].length, "The difference set should have 3 entries.")
      .toEqual(3);
    expect(difference.has(a), "The difference set should have key a.").toBe(
      true,
    );
    expect(difference.has(b), "The difference set should have key b.").toBe(
      true,
    );
    expect(difference.has(c), "The difference set should have key c.").toBe(
      true,
    );
  });

  it("should return an empty set if there are no unique elements", () => {
    const set1 = new IterableWeakSet([a, b, c]);
    const set2 = new IterableWeakSet([a, b, c]);

    const difference = set1.difference(set2);

    expect(difference.size, "The difference set should have 0 entries.")
      .toEqual(0);
    expect([...difference].length, "The difference set should have 0 entries.")
      .toEqual(0);
  });

  it("should return the first set if the second set is empty", () => {
    const set1 = new IterableWeakSet([a, b, c]);
    const set2 = new IterableWeakSet();

    const difference = set1.difference(set2);

    expect(difference.size, "The difference set should have 3 entries.")
      .toEqual(3);
    expect([...difference].length, "The difference set should have 3 entries.")
      .toEqual(3);
  });

  it.ignore("should throw if the 'other' argument is not a set-like object", () => {
    const set = new IterableWeakSet([a, b, c]);

    expect(() => set.difference({} as never)).toThrow(TypeError);
  });
});

describe("IterableWeakSet.prototype.symmetricDifference", () => {
  it("should return a new set containing only elements that are unique to each set", () => {
    const set1 = new IterableWeakSet([a, b, c, d, e]);
    const set2 = new IterableWeakSet([d, e, f, g, h]);

    const symmetricDifference = set1.symmetricDifference(set2);

    expect(
      symmetricDifference.size,
      "The symmetric difference set should have 6 entries.",
    ).toEqual(6);
    expect(
      [...symmetricDifference].length,
      "The symmetric difference set should have 6 entries.",
    ).toEqual(6);
    expect(
      symmetricDifference.has(a),
      "The symmetric difference set should have key a.",
    ).toBe(true);
    expect(
      symmetricDifference.has(b),
      "The symmetric difference set should have key b.",
    ).toBe(true);
    expect(
      symmetricDifference.has(c),
      "The symmetric difference set should have key c.",
    ).toBe(true);
    expect(
      symmetricDifference.has(f),
      "The symmetric difference set should have key f.",
    ).toBe(true);
    expect(
      symmetricDifference.has(g),
      "The symmetric difference set should have key g.",
    ).toBe(true);
    expect(
      symmetricDifference.has(h),
      "The symmetric difference set should have key h.",
    ).toBe(true);
  });

  it("should accept regular Set instances for the 'other' argument", () => {
    const set1 = new IterableWeakSet([a, b, c, d, e]);
    const set2 = new Set([d, e, f, g, h]);

    const symmetricDifference = set1.symmetricDifference(set2);

    expect(
      symmetricDifference.size,
      "The symmetric difference set should have 6 entries.",
    ).toEqual(6);
    expect(
      [...symmetricDifference].length,
      "The symmetric difference set should have 6 entries.",
    ).toEqual(6);
    expect(
      symmetricDifference.has(a),
      "The symmetric difference set should have key a.",
    ).toBe(true);
    expect(
      symmetricDifference.has(b),
      "The symmetric difference set should have key b.",
    ).toBe(true);
    expect(
      symmetricDifference.has(c),
      "The symmetric difference set should have key c.",
    ).toBe(true);
    expect(
      symmetricDifference.has(f),
      "The symmetric difference set should have key f.",
    ).toBe(true);
    expect(
      symmetricDifference.has(g),
      "The symmetric difference set should have key g.",
    ).toBe(true);
    expect(
      symmetricDifference.has(h),
      "The symmetric difference set should have key h.",
    ).toBe(true);
  });

  it("should accept set-like objects for the 'other' argument", () => {
    const set1 = new IterableWeakSet([a, b, c, d, e]);
    const set2 = new Map([[d, 1], [e, 2], [f, 3], [g, 4], [h, 5]]);

    const symmetricDifference = set1.symmetricDifference(set2 as never);

    expect(
      symmetricDifference.size,
      "The symmetric difference set should have 6 entries.",
    ).toEqual(6);
    expect(
      [...symmetricDifference].length,
      "The symmetric difference set should have 6 entries.",
    ).toEqual(6);
    expect(
      symmetricDifference.has(a),
      "The symmetric difference set should have key a.",
    ).toBe(true);
    expect(
      symmetricDifference.has(b),
      "The symmetric difference set should have key b.",
    ).toBe(true);
    expect(
      symmetricDifference.has(c),
      "The symmetric difference set should have key c.",
    ).toBe(true);
    expect(
      symmetricDifference.has(f),
      "The symmetric difference set should have key f.",
    ).toBe(true);
    expect(
      symmetricDifference.has(g),
      "The symmetric difference set should have key g.",
    ).toBe(true);
    expect(
      symmetricDifference.has(h),
      "The symmetric difference set should have key h.",
    ).toBe(true);
  });

  it("should return an empty set if there are no unique elements", () => {
    const set1 = new IterableWeakSet([a, b, c]);
    const set2 = new IterableWeakSet([a, b, c]);

    const symmetricDifference = set1.symmetricDifference(set2);

    expect(
      symmetricDifference.size,
      "The symmetric difference set should have 0 entries.",
    ).toEqual(0);
    expect(
      [...symmetricDifference].length,
      "The symmetric difference set should have 0 entries.",
    ).toEqual(0);
  });

  it("should return a new set even if the 'other' set is empty", () => {
    const set1 = new IterableWeakSet([a, b, c]);
    const set2 = new IterableWeakSet();

    const symmetricDifference = set1.symmetricDifference(set2);

    expect(
      symmetricDifference.size,
      "The symmetric difference set should have 3 entries.",
    ).toEqual(3);
    expect(
      [...symmetricDifference].length,
      "The symmetric difference set should have 3 entries.",
    ).toEqual(3);
  });

  it.ignore("should throw if the 'other' argument is not a set-like object", () => {
    const set = new IterableWeakSet([a, b, c]);

    expect(() => set.symmetricDifference({} as never)).toThrow(TypeError);
  });
});

describe("IterableWeakSet.prototype.isSupersetOf", () => {
  it("should return true if the set is a superset of the 'other' set", () => {
    const set = new IterableWeakSet([a, b, c, d, e]);
    const other = new IterableWeakSet([a, b, c]);

    const result = set.isSupersetOf(other);

    expect(result, "The set should be a superset of the 'other' set.").toEqual(
      true,
    );
  });

  it("should return false if the set is not a superset of the 'other' set", () => {
    const set = new IterableWeakSet([a, b, c]);
    const other = new IterableWeakSet([a, b, c, d, e]);

    const result = set.isSupersetOf(other);

    expect(result, "The set should not be a superset of the 'other' set.")
      .toEqual(false);
  });

  it("should return true if the 'other' set is empty", () => {
    const set = new IterableWeakSet([a, b, c]);
    const other = new IterableWeakSet();

    const result = set.isSupersetOf(other);

    expect(result, "The set should be a superset of the 'other' set.").toEqual(
      true,
    );
  });

  it.ignore("should throw if the 'other' argument is not a set-like object", () => {
    const set = new IterableWeakSet([a, b, c]);

    expect(() => set.isSupersetOf({} as never)).toThrow(TypeError);
  });
});

describe("IterableWeakSet.prototype.isSubsetOf", () => {
  it("should return true if the set is a subset of the 'other' set", () => {
    const set = new IterableWeakSet([a, b, c]);
    const other = new IterableWeakSet([a, b, c, d, e]);

    const result = set.isSubsetOf(other);

    expect(result, "The set should be a subset of the 'other' set.").toEqual(
      true,
    );
  });

  it("should return false if the set is not a subset of the 'other' set", () => {
    const set = new IterableWeakSet([a, b, c, d, e]);
    const other = new IterableWeakSet([a, b, c]);

    const result = set.isSubsetOf(other);

    expect(result, "The set should not be a subset of the 'other' set.")
      .toEqual(false);
  });

  it("should return true if the set is empty", () => {
    const set = new IterableWeakSet();
    const other = new IterableWeakSet([a, b, c]);

    const result = set.isSubsetOf(other);

    expect(result, "The set should be a subset of the 'other' set.").toEqual(
      true,
    );
  });

  it.ignore("should throw if the 'other' argument is not a set-like object", () => {
    const set = new IterableWeakSet([a, b, c]);

    expect(() => set.isSubsetOf({} as never)).toThrow(TypeError);
  });
});

describe("IterableWeakSet.prototype.isDisjointFrom", () => {
  it("should return true if the set has no elements in common with the 'other' set", () => {
    const set = new IterableWeakSet([a, b, c]);
    const other = new IterableWeakSet([d, e, f]);

    const result = set.isDisjointFrom(other);

    expect(
      result,
      "The set should have no elements in common with the 'other' set.",
    ).toEqual(true);
  });

  it("should return false if the set has elements in common with the 'other' set", () => {
    const set = new IterableWeakSet([a, b, c, d, e]);
    const other = new IterableWeakSet([d, e, f]);

    const result = set.isDisjointFrom(other);

    expect(
      result,
      "The set should have elements in common with the 'other' set.",
    ).toEqual(false);
  });

  it("should return true if the 'other' set is empty", () => {
    const set = new IterableWeakSet([a, b, c]);
    const other = new IterableWeakSet();

    const result = set.isDisjointFrom(other);

    expect(
      result,
      "The set should have no elements in common with the 'other' set.",
    ).toEqual(true);
  });

  it("should return true if the set is empty", () => {
    const set = new IterableWeakSet();
    const other = new IterableWeakSet([a, b, c]);

    const result = set.isDisjointFrom(other);

    expect(
      result,
      "The set should have no elements in common with the 'other' set.",
    ).toEqual(true);
  });

  it.ignore("should throw if the 'other' argument is not a set-like object", () => {
    const set = new IterableWeakSet([a, b, c]);

    expect(() => set.isDisjointFrom({} as never)).toThrow(TypeError);
  });
});

describe("IterableWeakSet.prototype[Symbol.toStringTag]", () => {
  it("should return '[object IterableWeakSet]' for the Symbol.toStringTag property", () => {
    const set = new IterableWeakSet();

    expect(Object.prototype.toString.call(set)).toEqual(
      "[object IterableWeakSet]",
    );
  });
});
