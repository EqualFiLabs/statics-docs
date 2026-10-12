import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { PROTOCOL_SOURCE_URL, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
};

const capabilities = [
  {
    title: "Fixed launch economics",
    body: "A fixed 1B STATICS supply, 800M across six Doppler curves, 200M committed to treasury vesting and Operator backing, and no post-launch mint path.",
    href: "/docs/tokenomics",
  },
  {
    title: "Phase 1 public markets",
    body: "Fee-paid public markets at launch, with ERC-20 and native ETH pairs, separate v4 LP and bilateral hook fees, and creator-selected initial fee rates.",
    href: "/docs/liquidity/protocol-pools",
  },
  {
    title: "Phase 1 permissioned venues",
    body: "Creator-authorized terms, venue controllers, a separate hook, trusted routing, and non-transferable approved liquidity positions.",
    href: "/docs/liquidity/permissioned-pools",
  },
  {
    title: "Managed protocol liquidity",
    body: "Optional managed POL uses explicit custody-constrained v4 positions. A general pool begins with POL disabled until its creator activates future funding.",
    href: "/docs/liquidity/permanent-liquidity",
  },
  {
    title: "Range rewards",
    body: "PositionNFT-managed liquidity keeps native v4 LP fees separate from funded gauge and allocator rewards.",
    href: "/docs/liquidity/canonical-lp-rewards",
  },
  {
    title: "STATICS staking",
    body: "Stake in a PositionNFT, select reward assets, and claim earned shares after the eligibility delay.",
    href: "/docs/rewards/global-rewards",
  },
  {
    title: "Shared PositionNFT",
    body: "A transferable account for Phase 1 staking, rewards, and managed LP ranges. Later phases add baskets, credit, and Dollar features.",
    href: "/docs/core/position-nft",
  },
  {
    title: "Later phases stay documented",
    body: "Phase 2 adds baskets and credit, Phase 3 adds Dollar, and Phase 4 adds Morpho to the same staged protocol.",
    href: "/docs/start/phase-one-launch",
  },
  {
    title: "Phase 1 deployment",
    body: "See verified Robinhood mainnet addresses and four launch pools. Check current liquidity, gauge activation, and governance before use.",
    href: "/docs/reference/phase-one-deployment",
  },
  {
    title: "Governed lifecycle",
    body: "The governance Safe currently owns Phase 1; a deployed timelock and guardian controls define the next governance stage.",
    href: "/docs/governance/timelock-and-roles",
  },
];

const personas = [
  {
    title: "STATICS holders & Operators",
    body: "Understand the fixed supply, launch inventory, treasury vesting, Operator backing, activation, and reward mechanics before participating.",
    links: [
      { label: "Tokenomics", href: "/docs/tokenomics" },
      { label: "Launch and vesting", href: "/docs/genesis/launch-and-vesting" },
      { label: "Operators overview", href: "/docs/genesis/overview" },
    ],
  },
  {
    title: "Market creators & partners",
    body: "Explore Phase 1 public and permissioned pool creation, fee policy, and creator revenue. Basket creation follows in Phase 2.",
    links: [
      { label: "Public pools", href: "/docs/liquidity/protocol-pools" },
      { label: "Permissioned venues", href: "/docs/liquidity/permissioned-pools" },
      { label: "Deployment", href: "/docs/reference/phase-one-deployment" },
    ],
  },
  {
    title: "LPs & STATICS stakers",
    body: "Use Phase 1 positions, native LP fees, range gauges, and separately funded rewards. Baskets, lending, and Dollar are documented for later phases.",
    links: [
      { label: "Range gauges", href: "/docs/liquidity/canonical-lp-rewards" },
      { label: "Global staking", href: "/docs/rewards/global-rewards" },
      { label: "Later phases", href: "/docs/start/phase-one-launch" },
    ],
  },
  {
    title: "Builders & indexers",
    body: "Match the ABI and manifest to the target deployment, then feature-detect the installed phase and use current onchain quotes.",
    links: [
      { label: "Integration", href: "/docs/reference/integration" },
      { label: "Deployment", href: "/docs/reference/phase-one-deployment" },
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
      <SiteHeader />

      <main className="landing" id="landing-content">
        <section className="landing-hero">
          <div className="crumbs">
            <span className="crumb-here">protocol docs</span>
          </div>
          <h1>Build lasting utility around onchain assets.</h1>
          <p className="lede">
            Statics Phase 1 brings hooked public and permissioned markets, PositionNFTs, STATICS staking,
            range rewards, and managed protocol liquidity. Phase 1 and Statics Genesis are deployed on Robinhood mainnet; check the Phase 1 snapshot for current readiness limits.
            Later Statics phases add baskets, lending, Dollar, and Morpho; those features remain documented here.
          </p>
          <div className="landing-actions">
            <Link className="cta" href="/docs/start/phase-one-launch">
              Explore Phase 1
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
