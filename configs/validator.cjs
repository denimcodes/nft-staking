const path = require("path");

function getProgram(programName) {
  return path.join("target", "deploy", programName);
}

module.exports = {
  validator: {
    commitment: "processed",
    programs: [
      {
        label: "NFT Staking Program",
        programId: "58LCGWxNcN1dsbDaWpR4YMNxVdSA8mx7pC8z59k6nfCA",
        deployPath: getProgram("nft_staking.so"),
      },
    ],
    accountsCluster: "https://api.metaplex.solana.com",
    accounts: [
      {
        label: "Token Metadata Program",
        accountId: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
        executable: true,
      },
      {
        label: "Token Auth Rules Program",
        accountId: "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg",
        executable: true,
      },
      {
        label: "MPL System Extras",
        accountId: "SysExL2WDyJi9aRZrXorrjHJut3JwHQ7R9bTyctbNNG",
        executable: true,
      },
      {
        label: "MPL Token Extras",
        accountId: "TokExjvjJmhKaRBShsBAsbSvEWMA1AgUNK7ps4SAc2p",
        executable: true,
      },
      {
        label: "Metaplex Standard Ruleset",
        accountId: "AdH2Utn6Fus15ZhtenW4hZBQnvtLgM1YCW2MfVp7pYS5",
        executable: false,
      },
    ],
  },
};