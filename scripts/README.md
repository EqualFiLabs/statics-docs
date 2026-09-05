# Documentation checks

Run the source checks against a clean checkout of the intended Statics revision.
Keep that revision distinct from the older public testnet deployment's SDK pin.

```sh
npm ci
npm test
STATICS_PATH=/path/to/statics npm run check:source
STATICS_PATH=/path/to/statics npm run check:examples
SDK_PATH=/path/to/deployment-sdk/src/index.ts \
  SDK_COMMIT=135b68b8c404a1f567ae834c2e46e517e5788e28 npm run check:abis
NEXT_TELEMETRY_DISABLED=1 npm run verify
```

`check:source` reads fresh-deployment expectations from
`test/deployment/DeployStatics.t.sol`, checks the documented current SDK revision
against the protocol's `HEAD` gitlink, checks selected public-interface coverage,
and retains the existing deployment-manifest and launch-source checks. These
checks detect specific drift; they do not establish complete semantic parity.

`check:examples` compiles the self-contained **Flash receiver** Solidity fence
against the actual `IStaticsFlashBorrower` source interface. It checks the
required success hash and requires a concrete contract. It does not compile
every illustrative fragment, execute a flash loan, or prove a trading strategy.
Solc is pinned to 0.8.33. Its legacy `tmp` dependency is overridden to 0.2.7 to
avoid introducing the older vulnerable temporary-file implementation.

`check:abis` requires a checkout of the exact deployment SDK revision and compares
the five vendored ABI arrays and provenance index. Do not regenerate these from
current SDK master while retaining the older deployment addresses.

`verify` checks internal routes, typechecks the site, builds its static pages,
and runs the configured search/agent-export postbuild. CI runs source checks and
example compilation as separate steps. None of these commands reruns protocol
tests, formal proofs, or live/fork deployment verification.
