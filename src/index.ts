import { PublicKey } from '@solana/web3.js';

export * from './gem-bank';
export * from './gem-farm';
export * from './gem-common';

export const GEM_BANK_PROG_ID = new PublicKey(
  'BNnBQXUwpC3B2wnhuoUND4WxLd55CDnTipYiVJY9LgMD'
);
export const GEM_FARM_PROG_ID = new PublicKey(
  '5r7yDN7ku1rKotMZGJTVaAG5XUtQeNUddGkKUyFQnxmE'
);
