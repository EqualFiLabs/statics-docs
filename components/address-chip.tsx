"use client";

import { useState } from "react";

export function AddressChip({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const isTransaction = value.length === 66;

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
    </span>
  );
}
