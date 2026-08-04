import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { TestnetBanner } from "@/components/testnet-banner";
import { APP_URL, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
};

const capabilities = [
  {
    title: "Static baskets",
    body: "Fixed-bundle ERC-20 basket tokens of up to 16 assets, with action-size fee tiers, measured custody, and a deliberate non-ERC-4626 redemption model.",
    href: "/docs/baskets/overview",
  },
  {
    title: "Statics Dollar",
    body: "USDstx senior dollar minted from volatile or pegged collateral, paired with series-scoped Risk Shares, solvency gates, and recovery paths.",
    href: "/docs/dollar/overview",
  },
  {
    title: "Shared PositionNFT",
    body: "One transferable ERC-721 owns dollar legs, basket collateral, loans, reward selections, and staked canonical-liquidity positions.",
    href: "/docs/core/position-nft",
  },
  {
    title: "Global multi-asset rewards",
    body: "Stake STATICS and opt into up to 64 reward assets; new selections cannot capture historical fees, and unsupported shares route to governed accounting.",
    href: "/docs/rewards/global-rewards",
  },
  {
    title: "Self-backed lending",
    body: "Deposit basket collateral and borrow its proportional constituent vector at a basket-defined LTV, with independent tranches, extension, and recovery.",
    href: "/docs/lending/overview",
  },
  {
    title: "Constituent flash loans",
    body: "Borrow a basket's constituent vector atomically through a typed callback, while nested flash loans are blocked.",
    href: "/docs/lending/flash-composition",
  },
  {
    title: "Canonical v4 liquidity",
    body: "One zero-native-fee Uniswap v4 pool per basket constituent, with a Statics swap-fee hook that charges bilateral input and output fees.",
    href: "/docs/liquidity/canonical-pools",
  },
  {
    title: "Permanent protocol liquidity",
    body: "Matched protocol-owned inventory converts into hook-owned full-range liquidity with no ordinary withdrawal path until a basket enters ExitOnly.",
    href: "/docs/liquidity/permanent-liquidity",
  },
  {
    title: "Governed lifecycle",
    body: "A shared timelock owns both diamonds; guardians can restrict exposure while repayment, recovery, and exit paths remain available.",
    href: "/docs/governance/basket-lifecycle",
  },
];

const personas = [
  {
    title: "Basket creators",
    body: "Define constituent vectors, fee tiers, flash and lending fees, LTV, recovery penalty, and loan duration, then launch permissionless or genesis baskets.",
    links: [
      { label: "Static baskets", href: "/docs/baskets/overview" },
      { label: "Basket creation", href: "/docs/baskets/creation" },
      { label: "Source on GitHub", href: APP_URL },
    ],
  },
  {
    title: "Lenders & borrowers",
    body: "Deposit basket tokens as collateral, borrow the constituent vector at the configured LTV, extend tranches, repay principal, or recover after expiry.",
    links: [
      { label: "Self-backed lending", href: "/docs/lending/overview" },
      { label: "Loan lifecycle", href: "/docs/lending/loan-lifecycle" },
      { label: "Flash composition", href: "/docs/lending/flash-composition" },
    ],
  },
  {
    title: "Dollar users",
    body: "Mint USDstx from volatile or pegged collateral, hold fungible senior dollar, recombine equal senior and junior claims, and redeem against profile capacity.",
    links: [
      { label: "Statics Dollar", href: "/docs/dollar/overview" },
      { label: "Volatile profiles", href: "/docs/dollar/volatile-profiles" },
      { label: "Pegged profiles", href: "/docs/dollar/pegged-profiles" },
    ],
  },
  {
    title: "Builders & indexers",
    body: "Integrate against the single StaticsDiamond address, read the PositionNFT and custody model, and follow the measured-custody and approval conventions.",
    links: [
      { label: "Integration", href: "/docs/reference/integration" },
      { label: "Architecture", href: "/docs/core/architecture" },
      { label: "Source on GitHub", href: APP_URL },
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
          <h1>Multi-asset baskets, a self-backed dollar, and permanent protocol-owned liquidity.</h1>
          <p className="lede">
            Statics is an onchain multi-asset protocol built as two coordinated EIP-2535 diamonds. It combines
            fixed-bundle basket tokens, a senior/junior Statics Dollar, a shared PositionNFT, global multi-asset rewards,
            proportional self-backed lending, constituent flash loans, and canonical Uniswap v4 liquidity with bilateral
            hook fees.
          </p>
          <div className="landing-actions">
            <Link className="cta" href="/docs/introduction">
              Read the introduction
            </Link>
            <Link className="cta-secondary" href="/docs/core/architecture">
              Architecture
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
                  {persona.links.map((link) => (
                    <Link href={link.href} key={link.label}>
                      {link.label} →
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="docs-footer">
        <div className="docs-footer-inner">© <a href="https://equalfi.org" target="_blank" rel="noreferrer">EqualFi Labs</a>. All rights reserved.</div>
      </footer>
    </div>
  );
}
