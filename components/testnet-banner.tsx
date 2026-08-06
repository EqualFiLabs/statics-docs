"use client";

import Link from "next/link";

export function TestnetBanner() {
  function dismiss() {
    document.documentElement.dataset.banner = "off";
    try {
      localStorage.setItem("testnet-banner", "dismissed");
    } catch {
      // Storage may be blocked; the banner stays dismissed for this page view.
    }
  }

  return (
    <div className="banner" role="status">
      <span className="banner-dot" aria-hidden />
      <span>
        Integration beta on Robinhood Chain Testnet — basket creation is protocol-only.{" "}
        <Link href="/docs/rollout">Rollout</Link>
        {" · "}
        <Link href="/docs/start/testnet-onboarding">Get started</Link>
        {" · "}
        <Link href="/docs/reference/robinhood-testnet-deployment">Addresses</Link>
      </span>
      <button className="banner-dismiss" type="button" onClick={dismiss} aria-label="Dismiss testnet notice">
        ✕
      </button>
    </div>
  );
}
