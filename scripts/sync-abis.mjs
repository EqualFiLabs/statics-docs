// Vendors human-readable ABIs from the Statics SDK into public/abi/*.json so the
// docs site can serve machine-readable ABIs without coupling to the protocol
// repo at runtime. Re-run after protocol selector changes.
//
//   node scripts/sync-abis.mjs
//
// Override the source with SDK_PATH=/path/to/statics/sdk/src/index.ts.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DEFAULT_SDK = path.join(ROOT, "..", "statics", "statics", "sdk", "src", "index.ts");
const sdkPath = process.env.SDK_PATH ? path.resolve(process.env.SDK_PATH) : DEFAULT_SDK;
const outDir = path.join(ROOT, "public", "abi");

const TARGETS = [
  ["staticsAbi", "statics-diamond.json", "StaticsDiamond — the single integration address"],
  ["staticsSwapFeeHookAbi", "swap-fee-hook.json", "StaticsSwapFeeHook"],
  ["staticsLiquidityManagerAbi", "liquidity-manager.json", "StaticsLiquidityManager"],
  ["staticsTestnetFaucetAbi", "testnet-faucet.json", "StaticsFaucet (testnet)"],
  ["basketTokenAbi", "basket-token.json", "BasketToken (per-basket ERC-20)"],
];

if (!fs.existsSync(sdkPath)) {
  console.error(`sync-abis: SDK source not found at ${sdkPath}`);
  process.exit(1);
}

const src = fs.readFileSync(sdkPath, "utf8");

function extractSignatureArray(name) {
  const block = new RegExp(`export const ${name} = parseAbi\\(\\[([\\s\\S]*?)\\]\\)`);
  const match = src.match(block);
  if (!match) {
    throw new Error(`sync-abis: could not find ${name}`);
  }
  const sigs = [];
  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    const m = trimmed.match(/^"(.*)",?$/);
    if (m) sigs.push(m[1]);
  }
  return sigs;
}

fs.mkdirSync(outDir, { recursive: true });

const index = [];
for (const [exportName, file, label] of TARGETS) {
  const sigs = extractSignatureArray(exportName);
  fs.writeFileSync(path.join(outDir, file), `${JSON.stringify(sigs, null, 2)}\n`);
  index.push({ abi: exportName, file, label, signatures: sigs.length });
}

fs.writeFileSync(
  path.join(outDir, "index.json"),
  `${JSON.stringify(
    {
      format: "viem human-readable ABI (array of signatures)",
      note: "Fetch the JSON array; each entry is one function/event/error signature.",
      abis: index,
    },
    null,
    2,
  )}\n`,
);

console.log(`sync-abis: wrote ${index.length} ABIs to public/abi/`);
