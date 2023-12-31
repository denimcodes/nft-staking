use std::time::{Duration, SystemTime};

use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct NftStake {
    pub authority: Pubkey,
    pub nft_mint: Pubkey,
    pub is_active: bool,
    pub staked_on: i64,
    pub unstaked_on: i64,
    pub last_claimed: i64,
    pub reward_amount: u64,
    pub delegate_bump: u8,
}

impl NftStake {
    pub fn calculate_reward_amount(&self, rewards_per_day: u64) -> u64 {
        let unix_timestamp = if self.last_claimed == 0 {
            self.staked_on
        } else {
            self.last_claimed
        };

        let days_elapsed = Self::days_elapsed(unix_timestamp);
        return (rewards_per_day * days_elapsed) as u64;
    }

    fn days_elapsed(unix_timestamp: i64) -> u64 {
        let now = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap();
        let then = Duration::from_secs(unix_timestamp as u64);
        let elapsed = now - then;
        return elapsed.as_secs() / 86_400; // 86,400 seconds in a day
    }
}
