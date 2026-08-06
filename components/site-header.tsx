import type { ReactNode } from "react";

import Link from "next/link";

import { SearchDocs } from "@/components/search-docs";
import { StaticsMark } from "@/components/statics-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { DOCS_SOURCE_URL, PROTOCOL_SOURCE_URL } from "@/lib/site";

export function SiteHeader({ leading }: { leading?: ReactNode }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        {leading}

        <Link className="brand" href="/">
          <StaticsMark className="statics-mark" />
          <span className="brand-name">
            statics <span>/ docs</span>
          </span>
        </Link>

        <SearchDocs />

        <nav className="top-links" aria-label="Site">
          <Link href="/docs/introduction">Protocol</Link>
          <Link href="/docs/rollout">Rollout</Link>
          <Link href="/docs/reference/integration">Builders</Link>
          <Link href="/docs/reference/robinhood-testnet-deployment">Addresses</Link>
          <a href={DOCS_SOURCE_URL} target="_blank" rel="noreferrer">
            Edit docs ↗
          </a>
        </nav>
        <ThemeToggle />
        <a className="cta" href={PROTOCOL_SOURCE_URL} target="_blank" rel="noreferrer">
          Protocol code ↗
        </a>
      </div>
    </header>
  );
}
