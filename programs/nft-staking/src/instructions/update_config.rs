use anchor_lang::prelude::*;

use crate::{config::Config, SEED_CONFIG};

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(constraint = admin.key() == config.admin)]
    pub admin: Signer<'info>,
    #[account(mut, seeds = [SEED_CONFIG], bump)]
    pub config: Account<'info, Config>,
}

pub fn handler(
    ctx: Context<UpdateConfig>,
    reward_mint: Pubkey,
    reward_token: Pubkey,
    rewards_per_day: u64,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    config.reward_mint = reward_mint;
    config.reward_token = reward_token;
    config.rewards_per_day = rewards_per_day;

    Ok(())
}
