// Generates the agent-facing artifacts into the static export:
//   out/llms.txt       — llmstxt.org index with a key-facts preamble
//   out/llms-small.txt — condensed corpus (orientation + core pages)
//   out/llms-full.txt  — full clean concatenated corpus
//
// Reads clean markdown pre-rendered by the /raw/docs route handler during
// `next build`, plus public/addresses.json for machine-readable facts.
// Runs in postbuild (after next build + pagefind).

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://docs.statics.dev";
const SITE_NAME = "Statics Protocol Docs";
const SITE_DESCRIPTION =
  "Documentation for Statics — post-launch financial infrastructure for redeemable asset baskets, connected liquidity, self-backed credit, and the Statics Dollar. Starts with curated baskets; creation expands over time.";

const ROOT = process.cwd();
const contentDir = path.join(ROOT, "content", "docs");
const outDir = path.join(ROOT, "out");
const rawDir = path.join(outDir, "raw", "docs");

// Slugs included in the condensed small corpus (orientation-critical only).
const SMALL_SLUGS = new Set([
  "introduction",
  "rollout",
  "glossary",
  "start/testnet-onboarding",
  "core/architecture",
  "core/position-nft",
  "reference/integration",
  "reference/robinhood-testnet-deployment",
]);

function findMdxFiles(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findMdxFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith(".mdx") ? [entryPath] : [];
    })
    .sort();
}

function readCleanBody(slug) {
  const file = path.join(rawDir, slug);
  if (!fs.existsSync(file)) {
    return null;
  }
  return fs.readFileSync(file, "utf8").trim();
}

if (!fs.existsSync(outDir)) {
  console.error("generate-agent-output: out/ not found — run next build first.");
  process.exit(1);
}

const pages = findMdxFiles(contentDir)
  .map((filePath) => {
    const { data } = matter(fs.readFileSync(filePath, "utf8"));
    const slug = String(data.slug);
    return {
      slug,
      title: String(data.title),
      description: String(data.description),
      order: Number(data.order),
      body: readCleanBody(slug),
    };
  })
  .sort((left, right) => left.order - right.order);

// ---- key facts from public/addresses.json ----
const addresses = JSON.parse(fs.readFileSync(path.join(ROOT, "public", "addresses.json"), "utf8"));
const facts = [
  `Chain: ${addresses.network.name} (chainId ${addresses.network.chainId}) — ${addresses.network.status}`,
  `Integration address (StaticsDiamond): ${addresses.integrationAddress}`,
  `Statics Dollar (USDstx): ${addresses.tokens.USDstx.address}`,
  `Source commit: ${addresses.source.commit}`,
  `Explorer: ${addresses.network.explorer}`,
  `Machine-readable addresses: ${SITE_URL}/addresses.json`,
  `ABIs: ${SITE_URL}/abi/index.json (diamond, hook, manager, faucet, basket token)`,
];

// ---- llms.txt (index) ----
const index = [
  `# ${SITE_NAME}`,
  "",
  `> ${SITE_DESCRIPTION}`,
  "",
  "## Key facts",
  "",
  ...facts.map((f) => `- ${f}`),
  "",
  "## Context tiers",
  "",
  `- Condensed: ${SITE_URL}/llms-small.txt`,
  `- Full corpus: ${SITE_URL}/llms-full.txt`,
  "",
  "## Docs (clean markdown)",
  "",
  ...pages.map((p) => `- [${p.title}](${SITE_URL}/raw/docs/${p.slug}/): ${p.description}`),
  "",
].join("\n");
fs.writeFileSync(path.join(outDir, "llms.txt"), index);

// ---- corpus builder ----
function pageBlock(p) {
  return [`# ${p.title}`, "", `URL: ${SITE_URL}/raw/docs/${p.slug}/`, "", `> ${p.description}`, "", p.body ?? "(body unavailable)"].join(
    "\n",
  );
}

// ---- llms-full.txt ----
const full = pages.map(pageBlock).join("\n\n---\n\n");
fs.writeFileSync(path.join(outDir, "llms-full.txt"), `${full}\n`);

// ---- llms-small.txt ----
const smallPages = pages.filter((p) => SMALL_SLUGS.has(p.slug));
const smallHeader = [
  `# ${SITE_NAME} — condensed context`,
  "",
  `> ${SITE_DESCRIPTION}`,
  "",
  "## Key facts",
  "",
  ...facts.map((f) => `- ${f}`),
  "",
  "This is the orientation subset. Load the full corpus at "
    + `${SITE_URL}/llms-full.txt and machine-readable facts at ${SITE_URL}/addresses.json.`,
  "",
  "---",
  "",
].join("\n");
const small = smallPages.map(pageBlock).join("\n\n---\n\n");
fs.writeFileSync(path.join(outDir, "llms-small.txt"), `${smallHeader}${small}\n`);

const missing = pages.filter((p) => p.body === null).map((p) => p.slug);
console.log(
  `generate-agent-output: ${pages.length} pages | llms.txt, llms-small.txt (${smallPages.length}), llms-full.txt${
    missing.length ? ` | missing clean bodies: ${missing.join(", ")}` : ""
  }`,
);
