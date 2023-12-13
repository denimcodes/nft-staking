import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { createUmi as basecreateUmi } from "@metaplex-foundation/umi-bundle-tests";
import { nftStaking } from "../src";

export const createUmi = async () =>
  (await basecreateUmi())
    .use(nftStaking())
    .use(mplTokenMetadata())
    .use(mplToolbox());