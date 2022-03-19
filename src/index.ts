import { PublicKey } from '@solana/web3.js';

export * from './gem-bank';
export * from './gem-farm';
export * from './gem-common';

export const GEM_BANK_PROG_ID = new PublicKey(
  'jbMAZYjZhMdCUyqr8A5jH7mraSJZgJPK7EF6uEq9w8q'
);
export const GEM_FARM_PROG_ID = new PublicKey(
  'jfAAEGKDsddqwMZPtcF6xGm2WgPRWwfrkZ6Eo3jiFzb'
);
