use std::time::{Duration, SystemTime};

use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct NftStake {
    pub user: Pubkey,
    pub nft_mint: Pubkey,
    pub is_active: bool,
    pub staked_on: i64,
    pub unstaked_on: i64,
    pub last_claimed: i64,
    pub reward_amount: u64,

    pub bump: u8,
    pub delegate_bump: u8,
}

impl NftStake {
    pub fn calculate_reward_amount(&self) -> u64 {
        let unix_timestamp = if self.last_claimed == 0 {
            self.staked_on
        } else {
            self.last_claimed
        };

        let days_elapsed = Self::days_elapsed(unix_timestamp);
        let token_emssion = 100_000;
        return (token_emssion * days_elapsed) as u64;
    }

    fn days_elapsed(unix_timestamp: i64) -> i64 {
        let now = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap();
        let then = Duration::from_secs(unix_timestamp as u64);
        let elapsed = now - then;
        (elapsed.as_secs() / 86_400) as i64 // 86,400 seconds in a day
    }
}
