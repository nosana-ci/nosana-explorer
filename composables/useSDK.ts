import { Client } from '@nosana/sdk';

const network = ref('devnet');

const nosana = computed(() => {
  return new Client({
    solana: {
      network: network.value,
      jobs_address:
        network.value === 'devnet'
          ? 'nosJTmGQxvwXy23vng5UjkTbfv91Bzf9jEuro78dAGR'
          : 'nosJhNRqr2bc9g1nfGDcXXTXvYUmxD4cVwy2pMWhrYM',
    },
  });
});
export const useSDK = () => {
  return { nosana, network };
};
