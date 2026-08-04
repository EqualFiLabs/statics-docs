"use client";

import { useState } from "react";

const EXPLORER_URL = "https://explorer.testnet.chain.robinhood.com";

export function AddressChip({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const isTransaction = value.length === 66;
  const href = `${EXPLORER_URL}/${isTransaction ? "tx" : "address"}/${value}`;

  function copy() {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  return (
    <span className="addr-chip">
      <code>{value}</code>
      <button type="button" onClick={copy} title="Copy" aria-label={`Copy ${isTransaction ? "transaction hash" : "address"}`}>
        {copied ? "✓" : "⧉"}
      </button>
      <a href={href} target="_blank" rel="noreferrer" title="View on explorer" aria-label="View on explorer">
        ↗
      </a>
    </span>
  );
}
