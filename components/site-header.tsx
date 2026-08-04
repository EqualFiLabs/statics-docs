import type { ReactNode } from "react";

import Link from "next/link";

import { SearchDocs } from "@/components/search-docs";
import { StaticsMark } from "@/components/statics-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_URL } from "@/lib/site";

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
          <Link href="/docs/reference/builder-reference">Builders</Link>
          <Link href="/docs/reference/robinhood-testnet-deployment">Addresses</Link>
        </nav>
        <ThemeToggle />
        <a className="cta" href={APP_URL} target="_blank" rel="noreferrer">
          View source ↗
        </a>
      </div>
    </header>
  );
}
