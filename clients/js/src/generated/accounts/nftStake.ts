/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Account,
  Context,
  Pda,
  PublicKey,
  RpcAccount,
  RpcGetAccountOptions,
  RpcGetAccountsOptions,
  assertAccountExists,
  deserializeAccount,
  gpaBuilder,
  publicKey as toPublicKey,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  array,
  bool,
  i64,
  mapSerializer,
  publicKey as publicKeySerializer,
  struct,
  u64,
  u8,
} from '@metaplex-foundation/umi/serializers';

export type NftStake = Account<NftStakeAccountData>;

export type NftStakeAccountData = {
  discriminator: Array<number>;
  user: PublicKey;
  nftMint: PublicKey;
  isActive: boolean;
  stakedOn: bigint;
  unstakedOn: bigint;
  lastClaimed: bigint;
  rewardAmount: bigint;
  bump: number;
  delegateBump: number;
};

export type NftStakeAccountDataArgs = {
  user: PublicKey;
  nftMint: PublicKey;
  isActive: boolean;
  stakedOn: number | bigint;
  unstakedOn: number | bigint;
  lastClaimed: number | bigint;
  rewardAmount: number | bigint;
  bump: number;
  delegateBump: number;
};

export function getNftStakeAccountDataSerializer(): Serializer<
  NftStakeAccountDataArgs,
  NftStakeAccountData
> {
  return mapSerializer<NftStakeAccountDataArgs, any, NftStakeAccountData>(
    struct<NftStakeAccountData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['user', publicKeySerializer()],
        ['nftMint', publicKeySerializer()],
        ['isActive', bool()],
        ['stakedOn', i64()],
        ['unstakedOn', i64()],
        ['lastClaimed', i64()],
        ['rewardAmount', u64()],
        ['bump', u8()],
        ['delegateBump', u8()],
      ],
      { description: 'NftStakeAccountData' }
    ),
    (value) => ({
      ...value,
      discriminator: [231, 220, 78, 61, 9, 103, 95, 148],
    })
  ) as Serializer<NftStakeAccountDataArgs, NftStakeAccountData>;
}

export function deserializeNftStake(rawAccount: RpcAccount): NftStake {
  return deserializeAccount(rawAccount, getNftStakeAccountDataSerializer());
}

export async function fetchNftStake(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<NftStake> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  assertAccountExists(maybeAccount, 'NftStake');
  return deserializeNftStake(maybeAccount);
}

export async function safeFetchNftStake(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<NftStake | null> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  return maybeAccount.exists ? deserializeNftStake(maybeAccount) : null;
}

export async function fetchAllNftStake(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<NftStake[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts.map((maybeAccount) => {
    assertAccountExists(maybeAccount, 'NftStake');
    return deserializeNftStake(maybeAccount);
  });
}

export async function safeFetchAllNftStake(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<NftStake[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts
    .filter((maybeAccount) => maybeAccount.exists)
    .map((maybeAccount) => deserializeNftStake(maybeAccount as RpcAccount));
}

export function getNftStakeGpaBuilder(
  context: Pick<Context, 'rpc' | 'programs'>
) {
  const programId = context.programs.getPublicKey(
    'nftStaking',
    '58LCGWxNcN1dsbDaWpR4YMNxVdSA8mx7pC8z59k6nfCA'
  );
  return gpaBuilder(context, programId)
    .registerFields<{
      discriminator: Array<number>;
      user: PublicKey;
      nftMint: PublicKey;
      isActive: boolean;
      stakedOn: number | bigint;
      unstakedOn: number | bigint;
      lastClaimed: number | bigint;
      rewardAmount: number | bigint;
      bump: number;
      delegateBump: number;
    }>({
      discriminator: [0, array(u8(), { size: 8 })],
      user: [8, publicKeySerializer()],
      nftMint: [40, publicKeySerializer()],
      isActive: [72, bool()],
      stakedOn: [73, i64()],
      unstakedOn: [81, i64()],
      lastClaimed: [89, i64()],
      rewardAmount: [97, u64()],
      bump: [105, u8()],
      delegateBump: [106, u8()],
    })
    .deserializeUsing<NftStake>((account) => deserializeNftStake(account))
    .whereField('discriminator', [231, 220, 78, 61, 9, 103, 95, 148]);
}

export function getNftStakeSize(): number {
  return 107;
}
