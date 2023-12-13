import { findMasterEditionPda, findMetadataPda, findTokenRecordPda } from "@metaplex-foundation/mpl-token-metadata";
import { createTokenIfMissing, findAssociatedTokenPda } from "@metaplex-foundation/mpl-toolbox";
import { KeypairSigner, PublicKey, Umi, generateSigner, publicKey, transactionBuilder } from "@metaplex-foundation/umi";
import { publicKey as pk, string } from "@metaplex-foundation/umi/serializers";
import { NFT_STAKING_PROGRAM_ID, claimReward, stake, unstake } from "src";

export async function createStakeIx(umi: Umi, user: KeypairSigner, nftMint: PublicKey) {
  const nftStake = generateSigner(umi);

  const [delegate, delegateBump] = umi.eddsa.findPda(NFT_STAKING_PROGRAM_ID, [
    string({ size: "variable" }).serialize(SEED_DELEGATE),
    pk().serialize(nftStake.publicKey),
  ]);

  const [lockedAddress, _] = umi.eddsa.findPda(NFT_STAKING_PROGRAM_ID, [
    string({ size: "variable" }).serialize(SEED_LOCKED_ADDRESS),
    pk().serialize(nftStake.publicKey),
  ]);

  const [edition] = findMasterEditionPda(umi, {
    mint: nftMint,
  });

  const [metadata] = findMetadataPda(umi, {
    mint: nftMint,
  });

  const [userNftToken] = findAssociatedTokenPda(umi, { mint: nftMint, owner: user.publicKey });
  const [userNftTokenRecord] = findTokenRecordPda(umi, { mint: nftMint, token: userNftToken });

  return stake(umi, {
    user,
    nftStake: nftStake,
    nftMint: nftMint,
    userNftToken,
    userNftTokenRecord,
    delegate,
    lockedAddress,
    edition,
    metadata,
    authRules: publicKey(METAPLEX_STANDARD_RULESET),
    delegateBump
  });
}

export function unstakeNft(umi: Umi, user: KeypairSigner, nftStake: PublicKey, nftMint: PublicKey) {
  const [delegate] = umi.eddsa.findPda(NFT_STAKING_PROGRAM_ID, [
    string({ size: "variable" }).serialize(SEED_DELEGATE),
    pk().serialize(nftStake),
  ]);

  const [lockedAddress, _] = umi.eddsa.findPda(NFT_STAKING_PROGRAM_ID, [
    string({ size: "variable" }).serialize(SEED_LOCKED_ADDRESS),
    pk().serialize(nftStake),
  ]);

  const [edition] = findMasterEditionPda(umi, {
    mint: nftMint,
  });

  const [metadata] = findMetadataPda(umi, {
    mint: nftMint,
  });

  const [userNftToken] = findAssociatedTokenPda(umi, { mint: nftMint, owner: user.publicKey });
  const [userNftTokenRecord] = findTokenRecordPda(umi, { mint: nftMint, token: userNftToken });

  return unstake(umi, {
    user,
    nftStake: nftStake,
    nftMint: nftMint,
    userNftToken,
    userNftTokenRecord,
    delegate,
    lockedAddress,
    edition,
    metadata,
    authRules: publicKey(METAPLEX_STANDARD_RULESET),
  });
}

export async function createClaimRewardIx(umi: Umi, user: KeypairSigner, nftStake: PublicKey, mint: PublicKey, rewardVaultAuthority: KeypairSigner) {
  const [config] = umi.eddsa.findPda(NFT_STAKING_PROGRAM_ID, [string().serialize(SEED_CONFIG)]);

  const [rewardVaultToken] = findAssociatedTokenPda(umi, { mint: mint, owner: rewardVaultAuthority.publicKey });
  const [userToken] = findAssociatedTokenPda(umi, { mint: mint, owner: user.publicKey });

  const createUserTokenIx = createTokenIfMissing(umi, {
    mint: mint,
    owner: user.publicKey
  })

  const claimRewardIx = claimReward(umi, {
    user,
    config,
    vaultAuthority: rewardVaultAuthority,
    nftStake: nftStake,
    mint,
    userToken,
    vaultToken: rewardVaultToken
  });

  transactionBuilder().add(createUserTokenIx).add(claimRewardIx);
}