import fs from "node:fs";
import path from "node:path";
import { compileFlashExample, errorMessage } from "./source-checks.mjs";

if (!process.env.STATICS_PATH) {
  console.error("check-solidity-examples: STATICS_PATH is required");
  process.exit(1);
}

try {
  const version = compileFlashExample(
    fs.readFileSync("content/docs/lending/flash-composition.mdx", "utf8"),
    fs.readFileSync(path.join(process.env.STATICS_PATH, "src/interfaces/IStaticsFlashBorrower.sol"), "utf8"),
  );
  console.log(`check-solidity-examples: flash receiver compiles against the source interface with solc ${version}`);
} catch (error) {
  console.error(`check-solidity-examples: ${errorMessage(error)}`);
  process.exit(1);
}
