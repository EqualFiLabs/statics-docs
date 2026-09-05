import assert from "node:assert/strict";
import test from "node:test";
import { compileFlashExample, deploymentShapes, errorMessage } from "./source-checks.mjs";

test("deployment counts come from assertions, ignoring stale comments", () => {
  assert.deepEqual(deploymentShapes(`
    string memory explorer = "https://example.invalid/_assertManifest(diamond, 1, 1)";
    // _assertManifest(diamond, 30, 254);
    /*
      _assertManifest(deployment.core, 9, 90);
    */
    _assertManifest(deployment.core, 11, 95);
    _assertManifest(diamond, 34, 283); // executable expectation
  `), { StaticsDollarCoreDiamond: "11 facets / 95 selectors", StaticsDiamond: "34 facets / 283 selectors" });
});

test("non-Error failures retain useful diagnostics", () => {
  assert.equal(errorMessage(new Error("ordinary failure")), "ordinary failure");
  assert.equal(errorMessage("thrown text"), "thrown text");
  assert.equal(errorMessage(404), "404");
});

test("missing or conflicting deployment assertions fail closed", () => {
  assert.throws(() => deploymentShapes("installs 30 facets and 254 selectors"), /unable to derive/);
  assert.throws(() => deploymentShapes(`
    _assertManifest(diamond, 30, 254);
    _assertManifest(diamond, 34, 283);
  `), /ambiguous/);
});

const iface = `pragma solidity 0.8.33;
interface IStaticsFlashBorrower {
  function onStaticsFlashLoan(address, uint256, address[] calldata, uint256[] calldata, uint256[] calldata, bytes calldata) external returns (bytes32);
}`;
const example = `pragma solidity 0.8.33;
import {IStaticsFlashBorrower} from "src/interfaces/IStaticsFlashBorrower.sol";
contract DocumentedFlashReceiver is IStaticsFlashBorrower {
  function onStaticsFlashLoan(address, uint256, address[] calldata, uint256[] calldata, uint256[] calldata, bytes calldata) external pure override returns (bytes32) {
    return keccak256("IStaticsFlashBorrower.onStaticsFlashLoan");
  }
}`;
const fence = (code) => "```solidity Flash receiver\n" + code + "\n```\n";

test("a concrete receiver compiles against the callback interface", () => {
  assert.match(compileFlashExample(fence(example), iface), /^0\.8\.33/);
});

test("old callback arity and return width are rejected", () => {
  assert.throws(() => compileFlashExample(fence(example.replace("address, uint256, address[] calldata,", "uint256,")), iface), /override|abstract/);
  assert.throws(() => compileFlashExample(fence(example.replace("returns (bytes32)", "returns (bytes4)")), iface), /return types|implicitly convertible/);
});

test("selector return, missing example, and abstract receivers fail validation", () => {
  assert.throws(() => compileFlashExample(fence(example.replace(/import[^;]+;/, "")), iface), /real IStaticsFlashBorrower/);
  assert.throws(() => compileFlashExample(fence(example.replace('keccak256("IStaticsFlashBorrower.onStaticsFlashLoan")', "IStaticsFlashBorrower.onStaticsFlashLoan.selector")), iface), /success hash/);
  assert.throws(() => compileFlashExample("No example", iface), /expected one/);
  assert.throws(() => compileFlashExample(fence(example.replace("contract DocumentedFlashReceiver", "abstract contract DocumentedFlashReceiver")), iface), /concrete/);
});
