import { UmiPlugin } from "@metaplex-foundation/umi";
import { createNftStakingProgram } from "./generated";

export const nftStaking = (): UmiPlugin => ({
  install(umi) {
    umi.programs.add(createNftStakingProgram(), false);
  },
});