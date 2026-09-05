import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { deploymentShapes } from "./source-checks.mjs";

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

function requireEqual(actual, expected, label) {
  if (String(actual).toLowerCase() !== String(expected).toLowerCase()) {
    errors.push(`deployment drift: ${label}: docs=${actual} source=${expected}`);
  }
}

const docsText = [
  ...walk(path.join(ROOT, "content", "docs")).filter((file) => file.endsWith(".mdx")),
  ...walk(path.join(ROOT, "app")).filter((file) => /\.(ts|tsx)$/.test(file)),
]
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n")
  .replace(/\s+/g, " ");

try {
  const shapes = deploymentShapes(read(staticsRoot, "test/deployment/DeployStatics.t.sol"));
  const architecture = read(ROOT, "content/docs/core/architecture.mdx").replace(/\s+/g, " ");
  for (const [name, shape] of Object.entries(shapes)) {
    requireText(architecture, `**${shape}**`, `${name} fresh-deployment shape`);
  }
  const gitlink = execFileSync("git", ["-C", staticsRoot, "ls-tree", "HEAD", "sdk"], { encoding: "utf8" });
  const sdkCommit = gitlink.match(/^160000 commit ([a-f0-9]{40})\s+sdk$/m)?.[1];
  if (!sdkCommit) throw new Error("cannot resolve protocol SDK gitlink");
  const sdkDocs = read(ROOT, "content/docs/reference/sdk.mdx");
  const documentedSdk = sdkDocs.match(/\| Current `statics` master source \| `([a-f0-9]{40})` \|/)?.[1];
  requireEqual(documentedSdk, sdkCommit, "current-source SDK revision");
} catch (error) {
  errors.push(`source drift: ${error.message}`);
}

// These high-impact surfaces previously had no public guide at all. Keep checks
// page-local so an unrelated mention cannot substitute for integration guidance.
for (const [page, sourceInterface, names] of [
  ["lending/morpho", "src/interfaces/IStaticsMorpho.sol", ["IStaticsMorpho", "deployMorphoCollateral", "recallMorphoCollateral", "borrowMorphoUsd", "repayMorphoUsd", "syncMorpho", "recoverMorphoAccountToken"]],
  ["core/position-nft", "src/interfaces/IStaticsPositionPortfolio.sol", ["IStaticsPositionPortfolio", "positionPortfolioCounts", "basketIdsOfPosition", "loanIdsOfPosition", "liquidityPositionIdsOfPosition", "globalRewardAssetsOfPosition", "riskSeriesIdsOfPosition", "morphoMarketIdsOfPosition"]],
  ["dollar/risk-liquidity", "src/dollar/interfaces/IStaticsDollarRiskLiquidity.sol", ["IStaticsDollarRiskLiquidity", "createAndStakeRiskShares", "stakeRiskShares", "unstakeRiskShares", "claimRiskProceeds", "riskLiquidity"]],
]) {
  const pageText = read(ROOT, `content/docs/${page}.mdx`);
  const source = read(staticsRoot, sourceInterface);
  for (const name of names) {
    requireText(pageText, name, `${page}: ${name}`);
    requireText(source, name, `${sourceInterface}: ${name}`);
  }
}

const launcher = read(staticsRoot, "script/DeployStaticsGenesis.s.sol");
const rewardsGuide = read(ROOT, "content/docs/rewards/global-rewards.mdx");
requireText(rewardsGuide, "eligibleWeight", "boost-adjusted global reward denominator");
requireText(rewardsGuide.toLowerCase(), "weighted", "pending top-up waiting-time accounting");
requireText(read(ROOT, "content/docs/core/custody.mdx"), "genesisRewardAccount", "separate Genesis reward custody reservation");

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

const sourceManifest = JSON.parse(read(staticsRoot, "deployments/robinhood-testnet-46630-statics.json") || "{}");
const docsManifest = JSON.parse(read(ROOT, "public/addresses.json") || "{}");
if (sourceManifest.source && docsManifest.source) {
  requireEqual(docsManifest.source.initialProtocolCommit, sourceManifest.source.protocolDeploymentCommit, "initial protocol commit");
  requireEqual(docsManifest.source.deploymentToolingCommit, sourceManifest.source.deploymentToolingCommit, "deployment tooling commit");
  requireEqual(docsManifest.source.currentProtocolCommit, sourceManifest.source.currentProtocolCommit, "current deployed protocol commit");
  requireEqual(docsManifest.source.staticsSdkCommit, sourceManifest.source.staticsSdkCommit, "deployment SDK commit");
  requireEqual(docsManifest.network.lastUpgradeBlock, sourceManifest.network.lastUpgradeBlock, "last upgrade block");
}

const contractMap = {
  StaticsDiamond: "staticsDiamond",
  StaticsDollarCoreDiamond: "staticsDollarCoreDiamond",
  StaticsSwapFeeHook: "swapFeeHook",
  StaticsLiquidityManager: "liquidityManager",
  StaticsTimelock: "timelock",
  StaticsDollarOracle: "staticsDollarOracle",
  PositionRenderer: "positionRenderer",
  AvatarSVG: "avatarSvg",
};
for (const [docsKey, sourceKey] of Object.entries(contractMap)) {
  requireEqual(
    docsManifest.contracts?.[docsKey]?.address,
    sourceManifest.contracts?.[sourceKey]?.address,
    `contract ${docsKey}`,
  );
}
requireEqual(docsManifest.tokens?.STATICS?.address, sourceManifest.contracts?.staticsToken?.address, "STATICS token");
requireEqual(docsManifest.tokens?.USDstx?.address, sourceManifest.contracts?.staticsDollar?.address, "USDstx token");
requireEqual(
  docsManifest.tokens?.ethLEV?.address,
  sourceManifest.contracts?.staticsDollarRiskShares?.address,
  "ethLEV token",
);

const dependencyMap = {
  WETH: "weth",
  UniswapV4PoolManager: "poolManager",
  UniswapV4PositionManager: "positionManager",
  Permit2: "permit2",
  Quoter: "quoter",
  StateView: "stateView",
  UniversalRouter: "universalRouter",
};
for (const [docsKey, sourceKey] of Object.entries(dependencyMap)) {
  requireEqual(docsManifest.dependencies?.[docsKey], sourceManifest.externalDependencies?.[sourceKey], `dependency ${docsKey}`);
}
requireEqual(
  docsManifest.interfaces?.IStaticsProtocolPools,
  sourceManifest.configuration?.protocolPoolsInterfaceId,
  "protocol-pools interface ID",
);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("check-source-drift: current source facts and deployment manifest match the docs");
