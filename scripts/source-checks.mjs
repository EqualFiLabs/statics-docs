import solc from "solc";

// Read executable deployment expectations, not another copy of the docs prose.
export function deploymentShapes(source) {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const result = {};
  const assertion = /^[\t ]*_assertManifest\(\s*(diamond|deployment\.core)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*;[\t ]*(?:\/\/[^\n]*)?$/gm;
  for (const match of code.matchAll(assertion)) {
    const name = match[1] === "diamond" ? "StaticsDiamond" : "StaticsDollarCoreDiamond";
    const shape = `${match[2]} facets / ${match[3]} selectors`;
    if (result[name] && result[name] !== shape) throw new Error(`ambiguous deployment shape for ${name}`);
    result[name] = shape;
  }
  for (const name of ["StaticsDiamond", "StaticsDollarCoreDiamond"]) {
    if (!result[name]) throw new Error(`unable to derive deployment shape for ${name}`);
  }
  return result;
}

export function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

export function compileFlashExample(markdown, interfaceSource) {
  const examples = [...markdown.matchAll(/^```solidity Flash receiver\s*\n([\s\S]*?)^```\s*$/gm)];
  if (examples.length !== 1) throw new Error("expected one self-contained Solidity Flash receiver example");
  const source = examples[0][1];
  if (!/import\s*\{\s*IStaticsFlashBorrower\s*\}\s*from\s*"src\/interfaces\/IStaticsFlashBorrower\.sol"\s*;/.test(source)
      || !/contract\s+DocumentedFlashReceiver\s+is\s+IStaticsFlashBorrower\b/.test(source)) {
    throw new Error("flash example must import and implement the real IStaticsFlashBorrower interface");
  }
  if (!/return\s+keccak256\("IStaticsFlashBorrower\.onStaticsFlashLoan"\)\s*;/.test(source)) {
    throw new Error("flash receiver must return the lender's bytes32 success hash");
  }
  const input = {
    language: "Solidity",
    sources: {
      "DocumentedFlashReceiver.sol": { content: source },
      "src/interfaces/IStaticsFlashBorrower.sol": { content: interfaceSource },
    },
    settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = (output.errors ?? []).filter((error) => error.severity === "error");
  if (errors.length) throw new Error(errors.map((error) => error.formattedMessage).join("\n"));
  const bytecode = output.contracts?.["DocumentedFlashReceiver.sol"]?.DocumentedFlashReceiver?.evm?.bytecode?.object;
  if (!bytecode) throw new Error("flash example must compile to a concrete DocumentedFlashReceiver contract");
  return solc.version();
}
