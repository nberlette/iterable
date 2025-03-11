<div align="center">

<h1>
<picture>
  <source srcset="./.github/assets/banner.svg" type="image/svg+xml" />
  <img src="./.github/assets/banner.png" alt="@iter/monorepo" width="100%" height="auto" />
</picture>
<span class="sr-only" hidden>@iter/able monorepo</span>
</h1>

<big class="sr-only" hidden><strong class="sr-only" hidden>TypeScript tools for
iterables, iterators, and collections.</strong></big>

<small><b>Compatible with Deno, Bun, Node, Cloudflare Workers, and
more.</b></small>

---

[![JSR][badge-jsr]][JSR] [![NPM][badge-npm]][NPM] [![MIT][badge-mit]][MIT]

</div>

## Packages

The packages currently published by this project are summarized below, with
brief examples and install instructions.

All of our packages are published to [JSR], a modern TypeScript-first registry
with a focus on security, performance, and compatibility. Packages are published
on JSR under the [`@iter/*`][jsr] scope, and mirrored on [NPM] for convenience
under the [`@itter/*`][npm] organization.

<!-- deno-fmt-ignore -->
> [!TIP]
> Click on the name of any package below to be taken to a dedicated `README.md`
> file, located in the corresponding subfolder of the [`./packages`](./packages)
> directory. There you will find complete API documentation, in-depth install
> instructions, and real-world usage examples, and more.

### [`@iter/weak-map`](./packages/weak_map/README.md) [![](https://jsr.io/badges/@iter/weak-map?logoColor=f7df1e&color=123&labelColor=123&style=flat)][jsr-weak-map]

This package provides an `IterableWeakMap` class that can be used as a drop-in
replacement for the standard `WeakMap` class. With an iterable API that
implements both the standard `Map` **and** `WeakMap` interfaces, it provides a
familiar surface area that can be used in place of either of its native
counterparts.

#### Installation

<img src="./.github/assets/deno.svg" width="48" height="44" align="left" alt="Deno" />

```sh
deno add jsr:@iter/weak-map
```

<img src="./.github/assets/jsr.svg" width="48" height="44" align="left" alt="JSR" />

```sh
npx jsr add @iter/weak-map
```

<img src="./.github/assets/npm.svg" width="48" height="44" align="left" alt="NPM" />

```sh
npm install @itter/weak-map
```

#### Example Usage

```ts
import { IterableWeakMap } from "@iter/weak-map";

// drop-in replacement for WeakMap
const weakMap = new IterableWeakMap([
  [{ key: 42 }, "Hello, World!"],
  [{ key: 41 }, "Goodbye, World!"],
]);

// but with an iterable API similar to Map
for (const [key, value] of weakMap) {
  console.log(key, value);
}

// and all the methods you'd expect from a Map
weakMap.set({ key: 43 }, "How do we get the key with no reference?");

const likeThis = [...weakMap.keys()].pop();
```

---

> [!NOTE]
> In the context of this project, the phrase _"Supports Deno"_ includes both
> Deno Deploy and the Deno Runtime (also known as the _"Deno CLI"_), unless
> otherwise specified.
>
> Note that not all runtime APIs are available in Deno Deploy that are available
> in the Deno CLI. If a package is not fully compatible with the Deno Deploy
> serverless (edge) runtime, it will be noted in the package's `README.md` file.

---

<div align="center"><p>

**[MIT] © [Nicholas Berlette]. All rights reserved.**

</p><p><b><small>

[GitHub] · [Issues] · [JSR] · [NPM] · [Deno]

</small></b></p><p>

[![][badge-jsr]][jsr]

</p></div>

[MIT]: https://nick.mit-license.org "Copyright © 2023-2024 Nicholas Berlette. MIT License."
[Nicholas Berlette]: https://github.com/nberlette "Nicholas Berlette's GitHub Profile"
[Issues]: https://github.com/nberlette/iterable/issues/new?assignees=nberlette "Found a bug? Let's squash it!"
[GitHub]: https://github.com/nberlette/iterable "View the `iterable` Repository on GitHub"
[jsr]: https://jsr.io/@iter "View all @iter/* packages on jsr.io"
[npm]: https://www.npmjs.com/org/itter "View @itter organization on NPM"
[deno]: https://deno.land/x/iterable "View iterable on deno.land/x"
[badge-jsr]: https://jsr.io/badges/@iter?labelColor=123&color=123&logoColor=f7df1e "View all @iter/* packages on jsr.io"
[badge-npm]: https://img.shields.io/badge/@itter-tomato.svg?logoWidth=32&logoColor=white&color=firebrick&logo=data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzLjExZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIC0yNSA1MTIgMTkwIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTU3LjUzOCAxNjQuMTAzaDY1LjY0MXYtMzIuODJoNjUuNjQyVjBIMTU3LjUzOHpNMjIzLjE4IDMyLjgySDI1NnY2NS42NGgtMzIuODJ6TTMxNS4wNzcgMHYxMzEuMjgyaDY1LjY0VjMyLjgyMWgzMi44MjF2OTguNDYxaDMyLjgyMVYzMi44MjFoMzIuODJ2OTguNDYxSDUxMlYwek0wIDEzMS4yODJoNjUuNjQxVjMyLjgyMWgzMi44MnY5OC40NjFoMzIuODIxVjBIMHoiLz48L3N2Zz4= "View all @itter packages on NPM"
[badge-mit]: https://img.shields.io/badge/-MIT-blue.svg?logo=github "MIT License"
[jsr-weak-map]: https://jsr.io/@iter/weak-map/doc "View the @iter/weak-map package on jsr.io"
