use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount},
    token_2022,
};

use crate::stake_info::StakeInfo;

// 1. update stake info
// 2. calculate reward
// 3. transfer reward to user from vault

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    pub vault_authority: Signer<'info>,
    #[account(mut)]
    pub stake_info: Account<'info, StakeInfo>,
    pub mint: Account<'info, Mint>,
    #[account(mut, token::mint = mint, token::authority = user)]
    pub user_token: Account<'info, TokenAccount>,
    #[account(mut, token::mint = mint, token::authority = vault_authority)]
    pub vault_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ClaimReward>) -> Result<()> {
    let stake_info = &mut ctx.accounts.stake_info;

    let reward_amount = stake_info.calculate_reward_amount();
    stake_info.reward_amount += reward_amount;

    // transfer reward to user
    let decimals = ctx.accounts.mint.decimals;
    let transfer_amount = reward_amount
        .checked_mul(ctx.accounts.mint.decimals as u64)
        .unwrap();
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        token_2022::TransferChecked {
            from: ctx.accounts.vault_token.to_account_info(),
            to: ctx.accounts.user_token.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
    );
    token_2022::transfer_checked(transfer_ctx, transfer_amount, decimals)?;

    Ok(())
}
