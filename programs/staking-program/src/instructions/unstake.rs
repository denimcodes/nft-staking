use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::mpl_token_metadata::instructions::{
        RevokeLockedTransferV1CpiBuilder, UnlockV1CpiBuilder,
    },
    token::{Mint, Token, TokenAccount},
};

use crate::{stake_info::StakeInfo, DELEGATE_SEED_PREFIX, LOCKED_ADDRESS_SEED_PREFIX};

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    pub vault: AccountInfo<'info>,
    pub mint: Account<'info, Mint>,
    #[account(token::mint = mint, token::authority = vault)]
    pub vault_token: Account<'info, TokenAccount>,
    #[account(token::mint = mint, token::authority = user)]
    pub user_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub stake_info: Account<'info, StakeInfo>,
    pub nft_mint: Account<'info, Mint>,
    #[account(token::mint = nft_mint, token::authority = user)]
    pub user_nft_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_nft_token_record: AccountInfo<'info>,
    #[account(mut, seeds = [DELEGATE_SEED_PREFIX.as_bytes(), stake_info.key().as_ref()], bump = stake_info.delegate_bump)]
    pub delegate: SystemAccount<'info>,
    #[account(mut, seeds = [LOCKED_ADDRESS_SEED_PREFIX.as_bytes(), stake_info.key().as_ref()], bump)]
    pub locked_address: SystemAccount<'info>,
    pub edition: AccountInfo<'info>,
    pub metadata: AccountInfo<'info>,
    #[account(mut)]
    pub auth_rules: AccountInfo<'info>,
    pub auth_rules_program: AccountInfo<'info>,
    pub token_metadata_program: AccountInfo<'info>,
    pub sysvar_instructions: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Unstake>) -> Result<()> {
    let stake_info = &mut ctx.accounts.stake_info;
    stake_info.unstaked_at = Clock::get()?.unix_timestamp;
    stake_info.is_active = false;

    // account infos
    let user_info = &ctx.accounts.user.to_account_info();
    let mint_info = &ctx.accounts.nft_mint.to_account_info();
    let user_nft_token_info = &ctx.accounts.user_nft_token.to_account_info();
    let delegate_info = &ctx.accounts.delegate.to_account_info();
    let edition_info = &ctx.accounts.edition.to_account_info();
    let metadata_info = &ctx.accounts.metadata.to_account_info();
    let borrower_nft_token_record_info = &ctx.accounts.user_nft_token_record.to_account_info();
    let sysvar_instructions_info = &ctx.accounts.sysvar_instructions.to_account_info();
    let token_program_info = &ctx.accounts.token_program.to_account_info();
    let metadata_program_info = &ctx.accounts.token_metadata_program.to_account_info();
    let system_program_info = &ctx.accounts.system_program.to_account_info();

    // signer seeds
    let stake_info_key = stake_info.key();
    let delegate_signer_seeds: &[&[&[u8]]] = &[&[
        DELEGATE_SEED_PREFIX.as_bytes(),
        stake_info_key.as_ref(),
        &[stake_info.delegate_bump],
    ]];

    // unlock nft
    msg!("unlock nft");
    let unlock_builder = &mut UnlockV1CpiBuilder::new(metadata_program_info);
    let unlock = unlock_builder
        .authority(delegate_info)
        .token_owner(Some(user_info))
        .token(user_nft_token_info)
        .mint(mint_info)
        .metadata(metadata_info)
        .edition(Some(edition_info))
        .token_record(Some(borrower_nft_token_record_info))
        .payer(user_info)
        .sysvar_instructions(sysvar_instructions_info)
        .system_program(system_program_info);
    unlock.invoke_signed(delegate_signer_seeds)?;

    // revoke locked transfer delegate authority
    msg!("revoke locked transfer delegate authority");
    let revoke_locked_transfer_builder =
        &mut RevokeLockedTransferV1CpiBuilder::new(metadata_program_info);
    let revoke_locked_transfer = revoke_locked_transfer_builder
        .delegate(delegate_info)
        .metadata(metadata_info)
        .master_edition(Some(edition_info))
        .token_record(Some(borrower_nft_token_record_info))
        .mint(mint_info)
        .token(user_nft_token_info)
        .authority(user_info)
        .payer(user_info)
        .sysvar_instructions(sysvar_instructions_info)
        .spl_token_program(Some(token_program_info))
        .system_program(system_program_info);
    revoke_locked_transfer.invoke_signed(delegate_signer_seeds)?;

    Ok(())
}
