use anchor_lang::prelude::*;

use crate::{config::Config, SEED_CONFIG};

#[derive(Accounts)]
pub struct InitConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(init, payer = admin, space = 8 + Config::INIT_SPACE,  seeds = [SEED_CONFIG], bump)]
    pub config: Account<'info, Config>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitConfig>,
    reward_mint: Pubkey,
    reward_token: Pubkey,
    rewards_per_day: u64,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    config.admin = ctx.accounts.admin.key();
    config.reward_mint = reward_mint;
    config.reward_token = reward_token;
    config.rewards_per_day = rewards_per_day;

    Ok(())
}
