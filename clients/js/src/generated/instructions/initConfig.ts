/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Context,
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  array,
  mapSerializer,
  publicKey as publicKeySerializer,
  struct,
  u64,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type InitConfigInstructionAccounts = {
  admin: Signer;
  config: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type InitConfigInstructionData = {
  discriminator: Array<number>;
  rewardMint: PublicKey;
  rewardToken: PublicKey;
  rewardsPerDay: bigint;
};

export type InitConfigInstructionDataArgs = {
  rewardMint: PublicKey;
  rewardToken: PublicKey;
  rewardsPerDay: number | bigint;
};

export function getInitConfigInstructionDataSerializer(): Serializer<
  InitConfigInstructionDataArgs,
  InitConfigInstructionData
> {
  return mapSerializer<
    InitConfigInstructionDataArgs,
    any,
    InitConfigInstructionData
  >(
    struct<InitConfigInstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['rewardMint', publicKeySerializer()],
        ['rewardToken', publicKeySerializer()],
        ['rewardsPerDay', u64()],
      ],
      { description: 'InitConfigInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [23, 235, 115, 232, 168, 96, 1, 231],
    })
  ) as Serializer<InitConfigInstructionDataArgs, InitConfigInstructionData>;
}

// Args.
export type InitConfigInstructionArgs = InitConfigInstructionDataArgs;

// Instruction.
export function initConfig(
  context: Pick<Context, 'programs'>,
  input: InitConfigInstructionAccounts & InitConfigInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'nftStaking',
    '58LCGWxNcN1dsbDaWpR4YMNxVdSA8mx7pC8z59k6nfCA'
  );

  // Accounts.
  const resolvedAccounts = {
    admin: {
      index: 0,
      isWritable: true as boolean,
      value: input.admin ?? null,
    },
    config: {
      index: 1,
      isWritable: true as boolean,
      value: input.config ?? null,
    },
    systemProgram: {
      index: 2,
      isWritable: false as boolean,
      value: input.systemProgram ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

  // Arguments.
  const resolvedArgs: InitConfigInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.systemProgram.value) {
    resolvedAccounts.systemProgram.value = context.programs.getPublicKey(
      'splSystem',
      '11111111111111111111111111111111'
    );
    resolvedAccounts.systemProgram.isWritable = false;
  }

  // Accounts in order.
  const orderedAccounts: ResolvedAccount[] = Object.values(
    resolvedAccounts
  ).sort((a, b) => a.index - b.index);

  // Keys and Signers.
  const [keys, signers] = getAccountMetasAndSigners(
    orderedAccounts,
    'programId',
    programId
  );

  // Data.
  const data = getInitConfigInstructionDataSerializer().serialize(
    resolvedArgs as InitConfigInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}