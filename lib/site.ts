// Canonical production domain. Drives absolute URLs in sitemap/OpenGraph output,
// so it must match the host actually serving the site.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://docs.staticsprotocol.com";

export const SITE_NAME = "Statics Protocol Docs";

export const SITE_DESCRIPTION =
  "Documentation for Statics — post-launch financial infrastructure for redeemable asset baskets, connected liquidity, self-backed credit, and the Statics Dollar. Starts with curated baskets; creation expands over time.";

// Protocol source repository. Set NEXT_PUBLIC_APP_URL once a product app URL is final.
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://github.com/EqualFiLabs/statics";

export const PROTOCOL_SOURCE_URL = APP_URL;

export const DOCS_SOURCE_URL =
  process.env.NEXT_PUBLIC_DOCS_URL ?? "https://github.com/EqualFiLabs/statics-docs";
