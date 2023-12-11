use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::mpl_token_metadata::instructions::{
        DelegateLockedTransferV1CpiBuilder, LockV1CpiBuilder,
    },
    token::{Mint, Token, TokenAccount},
};

use crate::{stake_info::StakeInfo, DELEGATE_SEED_PREFIX, LOCKED_ADDRESS_SEED_PREFIX};

// 1. update stake info
// 2. update authority to delegate
// 3. lock nft

#[derive(Accounts)]
#[instruction(delegate_bump: u8)]
pub struct Stake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(init, payer = user, space = 8 + StakeInfo::INIT_SPACE)]
    pub stake_info: Account<'info, StakeInfo>,
    #[account(mint::authority = user)]
    pub nft_mint: Account<'info, Mint>,
    #[account(token::mint = nft_mint, token::authority = nft_mint)]
    pub user_nft_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_nft_token_record: AccountInfo<'info>,
    #[account(mut, seeds = [DELEGATE_SEED_PREFIX.as_bytes(), stake_info.key().as_ref()], bump = delegate_bump)]
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

pub fn handler(ctx: Context<Stake>, delegate_bump: u8) -> Result<()> {
    // TODO: verify nft

    let stake_info = &mut ctx.accounts.stake_info;
    stake_info.user = ctx.accounts.user.key();
    stake_info.nft_mint = ctx.accounts.nft_mint.key();
    stake_info.is_active = true;
    stake_info.staked_at = Clock::get()?.unix_timestamp as u64;

    let user_info = &ctx.accounts.user.to_account_info();
    let mint_info = &ctx.accounts.nft_mint.to_account_info();
    let user_nft_token_info = &ctx.accounts.user_nft_token.to_account_info();
    let delegate_info = &ctx.accounts.delegate.to_account_info();
    let edition_info = &ctx.accounts.edition.to_account_info();
    let metadata_info = &ctx.accounts.metadata.to_account_info();
    let user_nft_token_record_info = &ctx.accounts.user_nft_token_record.to_account_info();
    let sysvar_instructions_info = &ctx.accounts.sysvar_instructions.to_account_info();
    let token_program_info = &ctx.accounts.token_program.to_account_info();
    let metadata_program_info = &ctx.accounts.token_metadata_program.to_account_info();
    let system_program_info = &ctx.accounts.system_program.to_account_info();
    let auth_rules_info = &ctx.accounts.auth_rules.to_account_info();
    let auth_rules_program_info = &ctx.accounts.auth_rules_program.to_account_info();

    // set locked transfer delegate authority
    msg!("set locked transfer delegate authority");
    let mut delegate_locked_transfer_builder =
        DelegateLockedTransferV1CpiBuilder::new(metadata_program_info);
    let delegate_locked_transfer = delegate_locked_transfer_builder
        .payer(user_info)
        .mint(mint_info)
        .token(user_nft_token_info)
        .authority(user_info)
        .delegate(delegate_info)
        .locked_address(ctx.accounts.locked_address.key())
        .master_edition(Some(edition_info))
        .metadata(metadata_info)
        .token_record(Some(user_nft_token_record_info))
        .sysvar_instructions(sysvar_instructions_info)
        .spl_token_program(Some(token_program_info))
        .system_program(system_program_info)
        .authorization_rules(Some(auth_rules_info))
        .authorization_rules_program(Some(auth_rules_program_info));
    delegate_locked_transfer.invoke()?;

    //delegate signer seeds
    let stake_info_key = stake_info.key();
    let delegate_signer_seeds: &[&[&[u8]]] = &[&[
        DELEGATE_SEED_PREFIX.as_bytes(),
        stake_info_key.as_ref(),
        &[delegate_bump],
    ]];

    // lock nft asset
    msg!("lock nft");
    let mut lock_builder = LockV1CpiBuilder::new(metadata_program_info);
    let lock = lock_builder
        .authority(delegate_info)
        .token_owner(Some(user_info))
        .token(user_nft_token_info)
        .mint(mint_info)
        .metadata(metadata_info)
        .edition(Some(edition_info))
        .token_record(Some(user_nft_token_record_info))
        .payer(user_info)
        .sysvar_instructions(sysvar_instructions_info)
        .system_program(system_program_info);
    lock.invoke_signed(delegate_signer_seeds)?;

    Ok(())
}
