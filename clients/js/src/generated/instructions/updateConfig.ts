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
export type UpdateConfigInstructionAccounts = {
  admin: Signer;
  config: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type UpdateConfigInstructionData = {
  discriminator: Array<number>;
  rewardMint: PublicKey;
  rewardToken: PublicKey;
  rewardsPerDay: bigint;
};

export type UpdateConfigInstructionDataArgs = {
  rewardMint: PublicKey;
  rewardToken: PublicKey;
  rewardsPerDay: number | bigint;
};

export function getUpdateConfigInstructionDataSerializer(): Serializer<
  UpdateConfigInstructionDataArgs,
  UpdateConfigInstructionData
> {
  return mapSerializer<
    UpdateConfigInstructionDataArgs,
    any,
    UpdateConfigInstructionData
  >(
    struct<UpdateConfigInstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['rewardMint', publicKeySerializer()],
        ['rewardToken', publicKeySerializer()],
        ['rewardsPerDay', u64()],
      ],
      { description: 'UpdateConfigInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [29, 158, 252, 191, 10, 83, 219, 99],
    })
  ) as Serializer<UpdateConfigInstructionDataArgs, UpdateConfigInstructionData>;
}

// Args.
export type UpdateConfigInstructionArgs = UpdateConfigInstructionDataArgs;

// Instruction.
export function updateConfig(
  context: Pick<Context, 'programs'>,
  input: UpdateConfigInstructionAccounts & UpdateConfigInstructionArgs
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
  const resolvedArgs: UpdateConfigInstructionArgs = { ...input };

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
  const data = getUpdateConfigInstructionDataSerializer().serialize(
    resolvedArgs as UpdateConfigInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
