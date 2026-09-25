# Contributing to statics-docs

Thanks for helping with the Statics docs.

## Ways to contribute

- Correct a page in `content/docs/`
- Add a page
- Fix the site in `app/`, `components/`, or `lib/`

Open a pull request against `master`.

## Setup

Node.js 22 is required. CI uses the same version.

1. Fork [EqualFiLabs/statics-docs](https://github.com/EqualFiLabs/statics-docs) and clone your fork.
2. Create a branch from `master`.
3. Install dependencies and start the site.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Editing a page

Pages are MDX. Each file starts with this frontmatter:

```yaml
---
id: mint-and-redemption
slug: baskets/mint-and-redemption
label: Mint & redemption
title: Mint and redemption
description: Minting deposits the configured bundle plus a fee; redemption burns basket tokens and returns the same vector less the fee.
updated: 2026-08-04
order: 130
---
```

This is the frontmatter from `content/docs/baskets/mint-and-redemption.mdx`.

| Field | Purpose |
| --- | --- |
| `id` | Stable page id. Must be unique |
| `slug` | URL path after `/docs/`. Must be unique |
| `label` | Sidebar label |
| `title` | Page title |
| `description` | Page summary, shown under the title |
| `updated` | Shown on the page as the updated date, `YYYY-MM-DD` |
| `order` | Previous and next links, and sitemap order |
| `badge` | Optional sidebar badge |

Sidebar order is the `pageIds` list in `NAVIGATION_GROUPS` in `lib/docs.ts`, not `order`. After you add a page, add its `id` to the group it belongs in.

Link to another page with its slug:

```md
[Rollout](/docs/rollout)
```

Callouts:

```md
:::note Title
Body text.
:::
```

`note`, `warning`, and `success` are the supported tones.

A code fence can include a caption after the language:

````md
```text Example
one BasketToken = the fixed bundle
```
````

## Checks

Run this before you open a pull request:

```bash
npm run verify
```

That runs `check:links`, `typecheck`, and `build`.

CI runs on pull requests and on pushes to `master`. It also checks out [EqualFiLabs/statics](https://github.com/EqualFiLabs/statics) at `master` and the SDK commit recorded in `.github/workflows/ci.yml`, then runs `check:source` and `check:abis`.

To run those locally:

```bash
STATICS_PATH=/path/to/statics npm run check:source
```

```bash
SDK_PATH=/path/to/statics-sdk/src/index.ts \
SDK_COMMIT=<commit in .github/workflows/ci.yml> \
npm run check:abis
```

Do not edit `public/abi/` by hand. Regenerate it with `npm run sync-abis` using the same `SDK_PATH` and `SDK_COMMIT`.

## Pull requests

- Keep the pull request focused on one change.
- Describe what you changed.
- Make sure `npm run verify` passes.

The Docs CI workflow runs on pull requests and on pushes to `master`.
