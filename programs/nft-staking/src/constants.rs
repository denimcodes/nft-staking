use anchor_lang::prelude::*;
use solana_program::pubkey;

#[constant]
pub const SEED_DELEGATE: &str = "delegate";
pub const SEED_LOCKED_ADDRESS: &str = "locked_address";
pub const SEED_CONFIG: &[u8] = b"config";

pub const METAPLEX_STANDARD_RULESET: Pubkey =
    pubkey!("AdH2Utn6Fus15ZhtenW4hZBQnvtLgM1YCW2MfVp7pYS5");
