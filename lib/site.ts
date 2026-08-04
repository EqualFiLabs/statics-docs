// Set NEXT_PUBLIC_SITE_URL at build time once the production domain is final;
// the default only affects absolute URLs in sitemap/OpenGraph output.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://docs.statics.dev";

export const SITE_NAME = "Statics Protocol Docs";

export const SITE_DESCRIPTION =
  "Public documentation for Statics — onchain multi-asset baskets, the self-backed Statics Dollar, shared PositionNFT, global multi-asset rewards, self-backed lending, flash composition, and canonical Uniswap v4 liquidity.";

// Set NEXT_PUBLIC_APP_URL at build time once the app domain is final.
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://github.com/EqualFiLabs/statics";
