import { UmiPlugin } from "@metaplex-foundation/umi";
import { createStakingProgramProgram } from "./generated";

export const nftStaking = (): UmiPlugin => ({
  install(umi) {
    umi.programs.add(createStakingProgramProgram(), false);
  },
});