// Vendors human-readable ABIs from the Statics SDK into public/abi/*.json so the
// docs site can serve machine-readable ABIs without coupling to the protocol
// repo at runtime. Re-run after protocol selector changes.
//
//   node scripts/sync-abis.mjs
//
// Override the source with SDK_PATH=/path/to/statics/sdk/src/index.ts.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const sdkPath = process.env.SDK_PATH ? path.resolve(process.env.SDK_PATH) : "";
const expectedSdkCommit = process.env.SDK_COMMIT ?? "";
const outDir = path.join(ROOT, "public", "abi");
const checkOnly = process.argv.includes("--check");

const TARGETS = [
  ["staticsAbi", "statics-diamond.json", "StaticsDiamond — the single integration address"],
  ["staticsSwapFeeHookAbi", "swap-fee-hook.json", "StaticsSwapFeeHook"],
  ["staticsLiquidityManagerAbi", "liquidity-manager.json", "StaticsLiquidityManager"],
  ["staticsTestnetFaucetAbi", "testnet-faucet.json", "StaticsFaucet (testnet)"],
  ["basketTokenAbi", "basket-token.json", "BasketToken (per-basket ERC-20)"],
];

if (!sdkPath || !expectedSdkCommit) {
  console.error("sync-abis: SDK_PATH and SDK_COMMIT are required so deployed and unreleased ABIs cannot be mixed");
  process.exit(1);
}

if (!fs.existsSync(sdkPath)) {
  console.error(`sync-abis: SDK source not found at ${sdkPath}`);
  process.exit(1);
}

const sdkRoot = path.resolve(path.dirname(sdkPath), "..");
let actualSdkCommit;
try {
  actualSdkCommit = execFileSync("git", ["-C", sdkRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
} catch {
  console.error(`sync-abis: unable to read the SDK Git revision at ${sdkRoot}`);
  process.exit(1);
}
if (actualSdkCommit !== expectedSdkCommit) {
  console.error(`sync-abis: SDK commit mismatch: expected ${expectedSdkCommit}, found ${actualSdkCommit}`);
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

if (!checkOnly) fs.mkdirSync(outDir, { recursive: true });

let staleFiles = 0;

function writeOrCheck(filePath, contents) {
  if (!checkOnly) {
    fs.writeFileSync(filePath, contents);
    return;
  }
  if (!fs.existsSync(filePath) || fs.readFileSync(filePath, "utf8") !== contents) {
    console.error(`sync-abis: stale ${path.relative(ROOT, filePath)}`);
    staleFiles += 1;
  }
}

const index = [];
for (const [exportName, file, label] of TARGETS) {
  const sigs = extractSignatureArray(exportName);
  writeOrCheck(path.join(outDir, file), `${JSON.stringify(sigs, null, 2)}\n`);
  index.push({ abi: exportName, file, label, signatures: sigs.length });
}

writeOrCheck(
  path.join(outDir, "index.json"),
  `${JSON.stringify(
    {
      format: "viem human-readable ABI (array of signatures)",
      scope: "Robinhood Chain Testnet deployment",
      staticsSdkCommit: expectedSdkCommit,
      note: "Fetch the JSON array; each entry is one function/event/error signature. These ABIs match the recorded deployment, not unreleased master source.",
      abis: index,
    },
    null,
    2,
  )}\n`,
);

if (checkOnly && staleFiles > 0) {
  console.error(`sync-abis: ${staleFiles} vendored artifact(s) need regeneration`);
  process.exit(1);
}

console.log(
  checkOnly
    ? `sync-abis: ${index.length} deployed ABIs match ${expectedSdkCommit}`
    : `sync-abis: wrote ${index.length} deployed ABIs from ${expectedSdkCommit}`,
);
