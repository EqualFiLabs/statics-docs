import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { TestnetBanner } from "@/components/testnet-banner";
import { PROTOCOL_SOURCE_URL, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
};

const capabilities = [
  {
    title: "Redeemable baskets",
    body: "Fixed-bundle tokens of up to 16 assets. Mint and redeem the same constituent vector — deliberately not ERC-4626 yield vaults.",
    href: "/docs/baskets/overview",
  },
  {
    title: "Connected liquidity",
    body: "One canonical Uniswap v4 pool per constituent at launch, with bilateral hook fees and paths that arbitrageurs may use when prices diverge.",
    href: "/docs/liquidity/canonical-pools",
  },
  {
    title: "Permanent protocol liquidity",
    body: "Full-range POL can compound from matched fee inventory. Growth depends on activity; there is no ordinary withdrawal while a pool is active.",
    href: "/docs/liquidity/permanent-liquidity",
  },
  {
    title: "Self-backed credit",
    body: "Deposit BasketTokens and borrow the proportional constituent vector at the basket LTV — no price-oracle liquidation model.",
    href: "/docs/lending/overview",
  },
  {
    title: "Statics Dollar",
    body: "Senior USDstx from volatile or pegged collateral, with series-scoped Risk Shares on volatile paths and explicit solvency gates.",
    href: "/docs/dollar/overview",
  },
  {
    title: "Shared PositionNFT",
    body: "One transferable ERC-721 account for deposits, loans, Dollar legs, reward selections, and staked protocol-pool LP positions.",
    href: "/docs/core/position-nft",
  },
  {
    title: "Fee participation",
    body: "Routed swap and non-swap fees can accrue to creators, deposited baskets, eligible LPs, STATICS stakers, POL, and treasury when activity occurs.",
    href: "/docs/rewards/global-rewards",
  },
  {
    title: "Staged creation access",
    body: "Protocol-curated baskets first, optional partner deployments while owner-gated, then fee-gated open creation when readiness allows.",
    href: "/docs/rollout",
  },
  {
    title: "Governed lifecycle",
    body: "Shared timelock ownership, guardian quarantine, and ExitOnly wind-down while repayment and recovery paths stay available.",
    href: "/docs/governance/basket-lifecycle",
  },
];

const personas = [
  {
    title: "Users on testnet",
    body: "Claim faucet assets, stake STATICS, mint pegged USDstx, and use the live genesis basket — without creating a new market.",
    links: [
      { label: "Testnet onboarding", href: "/docs/start/testnet-onboarding" },
      { label: "Deployment addresses", href: "/docs/reference/robinhood-testnet-deployment" },
      { label: "Rollout status", href: "/docs/rollout" },
    ],
  },
  {
    title: "Token projects & partners",
    body: "After launching elsewhere, inventory or treasury capital can seed a Statics basket when creation access allows. Current source gives the immutable creator a fixed 5% hook-fee share but no admin rights.",
    links: [
      { label: "How Statics helps tokens", href: "/docs/introduction#already-launched-tokens" },
      { label: "Basket creation policy", href: "/docs/baskets/creation" },
      { label: "Rollout phases", href: "/docs/rollout" },
    ],
  },
  {
    title: "Lenders, LPs & Dollar users",
    body: "Deposit baskets for self-backed credit, provide or stake canonical liquidity, and mint or redeem Statics Dollar within profile limits.",
    links: [
      { label: "Self-backed lending", href: "/docs/lending/overview" },
      { label: "Canonical pools", href: "/docs/liquidity/canonical-pools" },
      { label: "Statics Dollar", href: "/docs/dollar/overview" },
    ],
  },
  {
    title: "Builders & indexers",
    body: "Integrate against StaticsDiamond, follow measured-custody approvals, and index PositionNFT and basket state from the published surfaces.",
    links: [
      { label: "Integration", href: "/docs/reference/integration" },
      { label: "SDK", href: "/docs/reference/sdk" },
      { label: "Protocol code", href: PROTOCOL_SOURCE_URL },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="docs-app">
      <a className="skip-link" href="#landing-content">
        Skip to content
      </a>
      <TestnetBanner />
      <SiteHeader />

      <main className="landing" id="landing-content">
        <section className="landing-hero">
          <div className="crumbs">
            <span className="crumb-here">protocol docs</span>
          </div>
          <h1>Build lasting utility around onchain assets.</h1>
          <p className="lede">
            Statics turns existing assets into redeemable, productive markets. Each basket connects spot
            trading, protocol fees, permanent protocol-owned liquidity, self-backed credit, and access to
            the Statics Dollar within a single Position NFT. Rather than launching new assets, Statics gives
            established assets and communities durable financial infrastructure after launch. Creation
            begins with curated baskets, expands through approved partners, and ultimately opens through
            permissionless, fee-gated deployment.
          </p>
          <div className="landing-actions">
            <Link className="cta" href="/docs/baskets/overview">
              Explore curated baskets
            </Link>
            <Link className="cta-secondary" href="/docs/introduction">
              How Statics works
            </Link>
            <Link className="cta-secondary" href="/docs/rollout">
              View rollout
            </Link>
          </div>
        </section>

        <section className="landing-section">
          <h2>What Statics provides</h2>
          <div className="card-grid">
            {capabilities.map((capability) => (
              <Link className="landing-card" href={capability.href} key={capability.title}>
                <div className="landing-card-title">{capability.title}</div>
                <p>{capability.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="landing-section">
          <h2>Choose your path</h2>
          <div className="card-grid persona-grid">
            {personas.map((persona) => (
              <div className="landing-card persona-card" key={persona.title}>
                <div className="landing-card-title">{persona.title}</div>
                <p>{persona.body}</p>
                <div className="persona-links">
                  {persona.links.map((link) =>
                    link.href.startsWith("http") ? (
                      <a href={link.href} key={link.label} target="_blank" rel="noreferrer">
                        {link.label} →
                      </a>
                    ) : (
                      <Link href={link.href} key={link.label}>
                        {link.label} →
                      </Link>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="docs-footer">
        <div className="docs-footer-inner">
          ©{" "}
          <a href="https://equalfi.org" target="_blank" rel="noreferrer">
            EqualFi Labs
          </a>
          . All rights reserved.
        </div>
      </footer>
    </div>
  );
}
