import { Client } from '@nosana/sdk';
const route = useRoute();
const network = ref(route.query.network === 'devnet' ? 'devnet' : 'mainnet');

watch(network, (value) => {
  const router = useRouter();
  const route = useRoute();
  if (value !== route.query.network) {
    router.push({ path: route.path, query: { network: value } });
  }
});

const nosana = computed(() => {
  return new Client({
    solana: {
      network:
        network.value === 'devnet'
          ? 'https://weathered-newest-sunset.solana-devnet.discover.quiknode.pro/e22ef3983d0200847e1a6247da9176626423f227'
          : 'https://try-rpc.mainnet.solana.blockdaemon.tech', // https://rpc-public.hellomoon.io
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
