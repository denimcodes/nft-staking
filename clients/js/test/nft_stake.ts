import { DigitalAssetWithToken, TokenDelegateRole, TokenState, createProgrammableNft, fetchDigitalAssetWithAssociatedToken, findMasterEditionPda, findMetadataPda, findTokenRecordPda } from "@metaplex-foundation/mpl-token-metadata";
import { createMintWithAssociatedToken, createTokenIfMissing, findAssociatedTokenPda } from "@metaplex-foundation/mpl-toolbox";
import { KeypairSigner, PublicKey, Umi, generateSigner, none, percentAmount, publicKey, some, transactionBuilder } from "@metaplex-foundation/umi";
import { generateSignerWithSol } from "@metaplex-foundation/umi-bundle-tests";
import { publicKey as pk, string } from "@metaplex-foundation/umi/serializers";
import test from "ava";
import { NFT_STAKING_PROGRAM_ID, claimReward, fetchNftStake, stake, unstake } from "../src";
import { createUmi } from "./_setup";

const METAPLEX_STANDARD_RULESET = "AdH2Utn6Fus15ZhtenW4hZBQnvtLgM1YCW2MfVp7pYS5";
type TestContext = {
  umi: Umi;
  user: KeypairSigner;
  nftStake: KeypairSigner;
  nftMint: KeypairSigner;
  userNftToken: PublicKey<string>;
  userNftTokenRecord: PublicKey<string>;
}

test.before(async t => {
  const umi = await createUmi();

  const user = await generateSignerWithSol(umi);
  const nftStake = generateSigner(umi);

  const nftMint = generateSigner(umi);

  const [userNftToken] = findAssociatedTokenPda(umi, { mint: nftMint.publicKey, owner: user.publicKey });
  const [userNftTokenRecord] = findTokenRecordPda(umi, { mint: nftMint.publicKey, token: userNftToken });

  const testContext: TestContext = {
    umi,
    user,
    nftMint,
    nftStake,
    userNftToken,
    userNftTokenRecord
  }
  t.context = testContext;
})

test.serial("stake nft", async (t) => {
  const testContext = t.context as TestContext;

  const umi = testContext.umi;

  const user = testContext.user;
  const nftStake = testContext.nftStake;

  const nftMint = testContext.nftMint;
  const userNftToken = testContext.userNftToken;
  const userNftTokenRecord = testContext.userNftTokenRecord;


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
  t.is(stakeAccount.user, user.publicKey);
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
  const testContext = t.context as TestContext;

  const umi = testContext.umi;
  const user = testContext.user;
  const nftStake = testContext.nftStake;

  const mint = generateSigner(umi);

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
  const testContext = t.context as TestContext;

  const umi = testContext.umi;

  const user = testContext.user;
  const nftStake = testContext.nftStake;

  const nftMint = testContext.nftMint;
  const userNftToken = testContext.userNftToken;
  const userNftTokenRecord = testContext.userNftTokenRecord;

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