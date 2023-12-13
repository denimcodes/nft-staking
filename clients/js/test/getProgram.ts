import test from "ava";
import { STAKING_PROGRAM_PROGRAM_ID } from "../src";
import { createUmi } from "./_setup";

test("it registers the program", async (t) => {
  const umi = await createUmi();
  const program = umi.programs.get("stakingProgram");
  t.true(program.publicKey == STAKING_PROGRAM_PROGRAM_ID);
});