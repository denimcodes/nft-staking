import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StakingProgram } from "../target/types/staking_program";

describe("staking-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.StakingProgram as Program<StakingProgram>;

  it("staking nft", async () => {
    // Add your test here.
  });
  it("unstaking nft", async () => {
    // Add your test here.
  });
  it("claim rewards", async () => {
    // Add your test here.
  });
});
