use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct StakeInfo {
    pub user: Pubkey,
    pub nft_mint: Pubkey,
    pub is_active: bool,
    pub staked_at: i64,
    pub unstaked_at: i64,
    pub reward_amount: u64,

    pub bump: u8,
    pub delegate_bump: u8,
}

impl StakeInfo {
    pub fn calculate_reward_amount(&self) -> u64 {
        return 0;
    }
}
