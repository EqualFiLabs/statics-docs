import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const staticsRoot = process.env.STATICS_PATH ? path.resolve(process.env.STATICS_PATH) : "";
const errors = [];

if (!staticsRoot) {
  console.error("check-source-drift: STATICS_PATH is required");
  process.exit(1);
}

function read(base, relativePath) {
  const file = path.join(base, relativePath);
  if (!fs.existsSync(file)) {
    errors.push(`missing ${file}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

function requireMatch(source, pattern, label) {
  const match = source.match(pattern);
  if (!match) errors.push(`source drift: unable to derive ${label}`);
  return match;
}

function requireText(source, expected, label) {
  if (!source.includes(expected)) errors.push(`docs drift: missing ${label}: ${expected}`);
}

const docsText = [
  ...walk(path.join(ROOT, "content", "docs")).filter((file) => file.endsWith(".mdx")),
  ...walk(path.join(ROOT, "app")).filter((file) => /\.(ts|tsx)$/.test(file)),
]
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n")
  .replace(/\s+/g, " ");

const architecture = read(staticsRoot, "docs/architecture.md");
const phaseOneShape = requireMatch(
  architecture,
  /The staged Phase 1 launcher installs (\d+) facets and (\d+) selectors/,
  "Phase 1 deployment shape",
);
const fullShape = requireMatch(
  architecture,
  /full-stack fresh-deployment launcher installs (\d+) facets and (\d+) selectors\s+on\s+`StaticsDiamond`, and (\d+) facets and (\d+) selectors on\s+`StaticsDollarCoreDiamond`/,
  "fresh deployment shape",
);
if (phaseOneShape) {
  requireText(docsText, `**${phaseOneShape[1]} facets / ${phaseOneShape[2]} selectors**`, "Phase 1 Diamond shape");
}
if (fullShape) {
  requireText(docsText, `**${fullShape[1]} facets / ${fullShape[2]} selectors**`, "full StaticsDiamond shape");
  requireText(docsText, `Core has ${fullShape[3]} facets / ${fullShape[4]} selectors`, "Core Diamond shape");
}

const phasePlan = read(staticsRoot, "docs/adr/staged-phase-one-launch.md");
const rollout = read(ROOT, "content/docs/rollout.mdx");
for (const [phase, expression] of [
  [2, /Phase 2 adds \d+ selectors for a cumulative (\d+) selectors across (\d+) facets/],
  [3, /Phase 3 adds \d+ selectors for a cumulative (\d+) selectors across (\d+) facets/],
  [4, /Phase 4 adds \d+ selectors for the final (\d+) selectors across (\d+) facets/],
]) {
  const match = requireMatch(phasePlan, expression, `Phase ${phase} selector count`);
  if (match) requireText(rollout, `${match[2]} facets, ${match[1]} selectors`, `Phase ${phase} rollout count`);
}

const launchGuide = read(ROOT, "content/docs/start/phase-one-launch.mdx");
for (const phrase of ["native ETH/ERC-20", "Permissioned venues", "Range gauges", "Managed POL", "Phase 2", "Phase 3", "Phase 4"]) {
  requireText(launchGuide, phrase, `Phase 1 launch guide ${phrase}`);
}

const launcher = read(staticsRoot, "script/DeployStaticsGenesis.s.sol");
for (const [constant, label] of [
  ["STATICS_SUPPLY", "fixed STATICS supply"],
  ["DOPPLER_INVENTORY", "Doppler inventory"],
  ["TREASURY_GENESIS_BACKING", "treasury Genesis backing"],
  ["TREASURY_STATICS_VESTING_PRINCIPAL", "treasury STATICS vesting"],
]) {
  const value = requireMatch(launcher, new RegExp(`\\b${constant}\\s*=\\s*([\\d_]+) ether;`), constant)?.[1];
  if (value) requireText(docsText, value.replaceAll("_", ","), label);
}
for (const staleClaim of [
  "APPROVED_ROBINHOOD_LAUNCH_CONFIG_HASH",
  "not yet production-ratified",
  "Production execution is disabled",
  "Source-only launch system",
  "production launch gate remains unratified",
  "No production Statics deployment is recorded",
  "production hash remains zero",
  "Not deployed; production hash is zero",
]) {
  if (docsText.toLowerCase().includes(staleClaim.toLowerCase())) {
    errors.push(`docs drift: stale pre-launch claim remains: ${staleClaim}`);
  }
}

const launchCurves = read(staticsRoot, "src/genesis/doppler/StaticsLaunchCurves.sol");
const farTick = requireMatch(launchCurves, /FAR_TICK\s*=\s*([\d_]+);/, "FAR_TICK")?.[1];
if (farTick) requireText(docsText, farTick.replaceAll("_", ","), "far tick");

const curvePattern =
  /tickLower:\s*(-?[\d_]+),\s*tickUpper:\s*(-?[\d_]+),\s*numPositions:\s*(\d+),\s*shares:\s*([\d.]+) ether/g;
const curves = [...launchCurves.matchAll(curvePattern)];
if (curves.length !== 6) {
  errors.push(`source drift: expected 6 launch curves, found ${curves.length}`);
} else {
  for (const [index, curve] of curves.entries()) {
    requireText(docsText, curve[1].replaceAll("_", ","), `curve ${index + 1} lower tick`);
    requireText(docsText, curve[2].replaceAll("_", ","), `curve ${index + 1} upper tick`);
  }
}
requireText(docsText, "**56 positions**", "launch position count");
requireText(docsText, "**800 million STATICS**", "launch inventory narrative");

const genesis = read(staticsRoot, "src/tokens/StaticsGenesis.sol");
requireText(genesis, 'ERC721("Statics Operators", "STATOPS")', "Operators collection identity in source");
requireText(docsText, "`Statics Operators`", "Operators ERC-721 name");
requireText(docsText, "`STATOPS`", "Operators symbol");
requireText(docsText, "`1..5000`", "Vault Operator range");
requireText(docsText, "`5001..5555`", "treasury Operator range");

const credit = read(staticsRoot, "src/interfaces/IStaticsGenesisVault.sol");
for (const signature of [
  "drawGenesisCredit(uint256 genesisId, uint256 amount)",
  "repayGenesisCredit(uint256 genesisId, uint256 amount)",
  "creditAvailable(uint256 genesisId)",
  "setCreditIncreasesPaused(bool paused)",
]) {
  requireText(credit, signature, `${signature} in source`);
  requireText(docsText, signature, `${signature} in docs`);
}

const feePolicy = read(staticsRoot, "src/libraries/LibProtocolPoolFee.sol");
const creatorShare = requireMatch(feePolicy, /CREATOR_SHARE_BPS\s*=\s*([\d_]+);/, "creator share")?.[1];
const configurableShare = requireMatch(
  feePolicy,
  /CONFIGURABLE_SHARE_BPS\s*=\s*([\d_]+);/,
  "configurable fee share",
)?.[1];
if (creatorShare) requireText(docsText, `${creatorShare.replaceAll("_", ",")} BPS`, "creator share");
if (configurableShare) {
  requireText(docsText, `${configurableShare.replaceAll("_", ",")} BPS`, "configurable share");
}

const pools = read(staticsRoot, "src/interfaces/IStaticsProtocolPools.sol");
for (const signature of [
  "createPool(CreatePoolParams calldata params, bytes calldata creatorAuthorization)",
  "setProtocolPoolFeeRate(PoolId poolId, PoolSwapFeeRate calldata feeRate)",
  "setBasketFeeAllocation(BasketFeeAllocation calldata allocation)",
  "setGeneralFeeAllocation(GeneralFeeAllocation calldata allocation)",
  "replaceLiquidityManager(address newManager)",
]) {
  requireText(pools, signature, `${signature} in current source`);
}
for (const name of [
  "createPool",
  "setProtocolPoolFeeRate",
  "setBasketFeeAllocation",
  "setGeneralFeeAllocation",
  "replaceLiquidityManager",
]) {
  requireText(docsText, `\`${name}`, `${name} in docs`);
}

for (const formalTarget of [
  "test/formal/StaticsGenesisVault.halmos.t.sol",
  "test/formal/StaticsFeeReceiver.halmos.t.sol",
  "test/formal/GenesisLaunchDistributor.halmos.t.sol",
  "test/formal/GenesisCredit.halmos.t.sol",
  "test/formal/StaticsGenesisAndVesting.halmos.t.sol",
  "verification/doppler/test/DopplerLaunchGeometry.halmos.t.sol",
  "certora/specs/GenesisVault.spec",
  "certora/specs/FeeReceiver.spec",
  "certora/specs/GenesisDistributor.spec",
  "certora/specs/TreasuryVesting.spec",
]) {
  read(staticsRoot, formalTarget);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("check-source-drift: current source facts match the docs");
