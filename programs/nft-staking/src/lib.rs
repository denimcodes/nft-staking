pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("58LCGWxNcN1dsbDaWpR4YMNxVdSA8mx7pC8z59k6nfCA");

#[program]
pub mod nft_staking {
    use super::*;

    pub fn stake(ctx: Context<Stake>, delegate_bump: u8) -> Result<()> {
        stake::handler(ctx, delegate_bump)
    }

    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        unstake::handler(ctx)
    }

    pub fn claim_reward(ctx: Context<ClaimReward>) -> Result<()> {
        claim_reward::handler(ctx)
    }
}
