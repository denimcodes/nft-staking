use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,
    pub reward_mint: Pubkey,
    pub reward_token: Pubkey,
    pub rewards_per_day: u64,
}
