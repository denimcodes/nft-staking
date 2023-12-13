import { DigitalAssetWithToken, TokenDelegateRole, TokenState, createProgrammableNft, fetchDigitalAssetWithAssociatedToken, findMasterEditionPda, findMetadataPda, findTokenRecordPda } from "@metaplex-foundation/mpl-token-metadata";
import { createMintWithAssociatedToken, createTokenIfMissing, findAssociatedTokenPda } from "@metaplex-foundation/mpl-toolbox";
import { KeypairSigner, Pda, PublicKey, Umi, generateSigner, none, percentAmount, publicKey, some, transactionBuilder } from "@metaplex-foundation/umi";
import { generateSignerWithSol } from "@metaplex-foundation/umi-bundle-tests";
import { publicKey as pk, string } from "@metaplex-foundation/umi/serializers";
import test from "ava";
import { NFT_STAKING_PROGRAM_ID, claimReward, fetchConfig, fetchNftStake, initConfig, stake, unstake } from "../src";
import { createUmi } from "./_setup";

const METAPLEX_STANDARD_RULESET = "AdH2Utn6Fus15ZhtenW4hZBQnvtLgM1YCW2MfVp7pYS5";
type TestContext = {
  umi: Umi;
  user: KeypairSigner;
  nftStake: KeypairSigner;
  nftMint: KeypairSigner;
  userNftToken: PublicKey<string>;
  userNftTokenRecord: PublicKey<string>;
  admin: KeypairSigner;
  config: Pda;
  rewardMint: KeypairSigner;
  vaultAuthority: KeypairSigner;
}

test.before(async t => {
  const umi = await createUmi();

  const user = await generateSignerWithSol(umi);
  const admin = await generateSignerWithSol(umi);
  const vaultAuthority = generateSigner(umi);
  const config = umi.eddsa.findPda(NFT_STAKING_PROGRAM_ID, [string({ size: "variable" }).serialize("config")]);
  const nftStake = generateSigner(umi);

  const nftMint = generateSigner(umi);
  const rewardMint = generateSigner(umi);

  const [userNftToken] = findAssociatedTokenPda(umi, { mint: nftMint.publicKey, owner: user.publicKey });
  const [userNftTokenRecord] = findTokenRecordPda(umi, { mint: nftMint.publicKey, token: userNftToken });

  const testContext: TestContext = {
    umi,
    user,
    nftMint,
    nftStake,
    userNftToken,
    userNftTokenRecord,
    admin,
    config,
    rewardMint,
    vaultAuthority
  }
  t.context = testContext;
})

test.serial("initialize config", async (t) => {
  const { umi, admin, config, rewardMint, vaultAuthority } = t.context as TestContext;

  const [rewardToken] = findAssociatedTokenPda(umi, { mint: rewardMint.publicKey, owner: vaultAuthority.publicKey });

  await initConfig(umi, {
    admin,
    config,
    rewardMint: rewardMint.publicKey,
    rewardToken,
    rewardsPerDay: 1000
  }).sendAndConfirm(umi);

  const configAccount = await fetchConfig(umi, config);
  t.is(configAccount.admin, admin.publicKey);
  t.is(configAccount.rewardMint, rewardMint.publicKey);
  t.is(configAccount.rewardToken, rewardToken);
  t.is(configAccount.rewardsPerDay, BigInt(1000));
})

test.serial("stake nft", async (t) => {
  const { umi, user, nftStake, nftMint, userNftToken, userNftTokenRecord } = t.context as TestContext;

  await createProgrammableNft(umi, {
    name: "Test PNft",
    uri: "",
    sellerFeeBasisPoints: percentAmount(0.5),
    mint: nftMint,
    ruleSet: some(publicKey(METAPLEX_STANDARD_RULESET)),
    token: userNftToken,
    tokenOwner: user.publicKey
  }).sendAndConfirm(umi);

  const [delegate, delegateBump] = umi.eddsa.findPda(NFT_STAKING_PROGRAM_ID, [
    string({ size: "variable" }).serialize("delegate"),
    pk().serialize(nftStake.publicKey),
  ]);

  const [lockedAddress, _] = umi.eddsa.findPda(NFT_STAKING_PROGRAM_ID, [
    string({ size: "variable" }).serialize("locked_address"),
    pk().serialize(nftStake.publicKey),
  ]);

  const [edition] = findMasterEditionPda(umi, {
    mint: nftMint.publicKey,
  });

  const [metadata] = findMetadataPda(umi, {
    mint: nftMint.publicKey,
  });

  await stake(umi, {
    user,
    nftStake: nftStake,
    nftMint: nftMint.publicKey,
    userNftToken,
    userNftTokenRecord,
    delegate,
    lockedAddress,
    edition,
    metadata,
    authRules: publicKey(METAPLEX_STANDARD_RULESET),
    delegateBump
  }).sendAndConfirm(umi);

  const stakeAccount = await fetchNftStake(umi, nftStake.publicKey);
  t.is(stakeAccount.authority, user.publicKey);
  t.is(stakeAccount.nftMint, nftMint.publicKey);
  t.is(stakeAccount.isActive, true);
  t.true(stakeAccount.stakedOn > 0 && stakeAccount.stakedOn <= Math.floor(Date.now() / 1000)
  );

  t.like(
    await fetchDigitalAssetWithAssociatedToken(
      umi,
      nftMint.publicKey,
      user.publicKey
    ),
    <DigitalAssetWithToken>{
      mint: { publicKey: nftMint.publicKey, supply: BigInt(1) },
      token: {
        owner: user.publicKey,
        amount: BigInt(1),
        delegate: some(delegate),
        delegatedAmount: BigInt(1),
      },
      tokenRecord: {
        delegate: some(delegate),
        delegateRole: some(TokenDelegateRole.LockedTransfer),
        state: TokenState.Locked,
      },
    }
  );
})

test.serial.failing("claim reward amount", async (t) => {
  const { umi, user, nftStake, config, rewardMint: mint } = t.context as TestContext;

  const vaultAuthority = generateSigner(umi);
  const [vaultToken] = findAssociatedTokenPda(umi, { mint: mint.publicKey, owner: vaultAuthority.publicKey });
  const [userToken] = findAssociatedTokenPda(umi, { mint: mint.publicKey, owner: user.publicKey });

  await createMintWithAssociatedToken(umi, {
    mint: mint,
    owner: vaultAuthority.publicKey,
    decimals: 6,
    amount: 10000
  }).sendAndConfirm(umi);

  const createUserTokenIx = createTokenIfMissing(umi, {
    mint: mint.publicKey,
    owner: user.publicKey
  })

  const claimRewardIx = claimReward(umi, {
    user,
    config,
    vaultAuthority,
    nftStake: nftStake.publicKey,
    mint: mint.publicKey,
    userToken,
    vaultToken
  });

  transactionBuilder().add(createUserTokenIx).add(claimRewardIx).sendAndConfirm(umi);

  const stakeAccount = await fetchNftStake(umi, nftStake.publicKey);
  t.true(stakeAccount.lastClaimed >= stakeAccount.stakedOn);
})

test.serial("unstake nft", async (t) => {
  const { umi, user, nftStake, nftMint, userNftToken, userNftTokenRecord } = t.context as TestContext;

  const [delegate] = umi.eddsa.findPda(NFT_STAKING_PROGRAM_ID, [
    string({ size: "variable" }).serialize("delegate"),
    pk().serialize(nftStake.publicKey),
  ]);

  const [lockedAddress] = umi.eddsa.findPda(NFT_STAKING_PROGRAM_ID, [
    string({ size: "variable" }).serialize("locked_address"),
    pk().serialize(nftStake.publicKey),
  ]);

  const [edition] = findMasterEditionPda(umi, {
    mint: nftMint.publicKey,
  });

  const [metadata] = findMetadataPda(umi, {
    mint: nftMint.publicKey,
  });

  await unstake(umi, {
    user,
    nftStake: nftStake.publicKey,
    nftMint: nftMint.publicKey,
    userNftToken: userNftToken,
    userNftTokenRecord: userNftTokenRecord,
    delegate: delegate,
    lockedAddress: lockedAddress,
    edition: edition,
    metadata: metadata,
    authRules: publicKey(METAPLEX_STANDARD_RULESET)
  }).sendAndConfirm(umi);

  const stakeAccount = await fetchNftStake(umi, nftStake.publicKey);
  t.true(stakeAccount.unstakedOn >= stakeAccount.stakedOn);

  t.like(
    await fetchDigitalAssetWithAssociatedToken(
      umi,
      nftMint.publicKey,
      user.publicKey
    ),
    <DigitalAssetWithToken>{
      mint: { publicKey: nftMint.publicKey, supply: BigInt(1) },
      token: {
        owner: user.publicKey,
        amount: BigInt(1),
        delegate: none(),
        delegatedAmount: BigInt(0),
      },
      tokenRecord: {
        delegate: none(),
        delegateRole: none(),
        state: TokenState.Unlocked,
      },
    }
  );
})