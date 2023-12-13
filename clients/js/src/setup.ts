import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { createUmi as baseCreateUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { nftStaking } from "./plugin";

export const createUmi = (rpcUrl: string) =>
  baseCreateUmi(rpcUrl)
    .use(nftStaking())
    .use(mplTokenMetadata())
    .use(mplToolbox());