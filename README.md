# statics-docs

Documentation site for [Statics Protocol](https://staticsprotocol.com/).

The published site is [docs.staticsprotocol.com](https://docs.staticsprotocol.com). Protocol source is [EqualFiLabs/statics](https://github.com/EqualFiLabs/statics).

## Table of contents

- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Contributing](#contributing)

## Prerequisites

- Node.js 22
- npm

## Getting started

```bash
git clone https://github.com/EqualFiLabs/statics-docs.git
cd statics-docs
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The site is a Next.js static export. Documentation pages are MDX files in `content/docs/`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Build the static site into `out/` |
| `npm run typecheck` | Run the TypeScript check |
| `npm run check:links` | Check page ids, slugs, and internal `/docs/` links |
| `npm run verify` | Run the link check, typecheck, and production build |
| `npm run check:source` | Compare the docs with a local checkout of the protocol repo. Requires `STATICS_PATH` |
| `npm run sync-abis` | Regenerate `public/abi/` from the SDK. Requires `SDK_PATH` and `SDK_COMMIT` |
| `npm run check:abis` | Check that `public/abi/` matches that SDK commit |

`output: "export"` is set in `next.config.mjs`, so the site to publish is `out/`. After `npm run build`, the `postbuild` script writes the Pagefind search index and `llms.txt`, `llms-small.txt`, and `llms-full.txt` into `out/`.

## Project structure

```text
content/docs/     Documentation pages
lib/docs.ts       Page loading and sidebar groups
lib/site.ts       Site name, description, and public URLs
app/              Routes, including /docs
components/       Site UI
public/abi/       Contract ABIs served by the site
public/addresses.json
scripts/          Link, source, and ABI checks
.github/workflows/ci.yml
```

Sidebar membership is `NAVIGATION_GROUPS` in `lib/docs.ts`. A page is omitted from the sidebar until its `id` is listed there.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

Protocol security reports go to the [Statics security policy](https://github.com/EqualFiLabs/statics/blob/master/SECURITY.md).
