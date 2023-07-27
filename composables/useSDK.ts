import { Client } from '@nosana/sdk';

const nosana = new Client({
  solana: {
    network: 'devnet',
  },
});
export const useSDK = () => {
  return nosana;
};
