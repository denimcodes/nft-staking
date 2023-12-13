import test from "ava";
import { NFT_STAKING_PROGRAM_ID } from "../src";
import { createUmi } from "./_setup";

test("it registers the program", async (t) => {
  const umi = await createUmi();
  const program = umi.programs.get("nftStaking");
  t.true(program.publicKey == NFT_STAKING_PROGRAM_ID);
});