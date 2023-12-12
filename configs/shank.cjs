const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "..", "idls");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..", "programs");

generateIdl({
  generator: "anchor",
  programName: "staking_program",
  programId: "58LCGWxNcN1dsbDaWpR4YMNxVdSA8mx7pC8z59k6nfCA",
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "staking-program"),
  rustbin: {
    locked: true,
    versionRangeFallback: "0.27.0",
  },
});