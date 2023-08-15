import { Client } from '@nosana/sdk';
const route = useRoute();
const network = ref(route.query.network === 'devnet' ? 'devnet' : 'mainnet');

watch(network, (value) => {
  const router = useRouter();
  const route = useRoute();
  if (value === 'devnet') {
    if (route.query.network !== 'devnet') {
      router.push({ path: route.path, query: { network: 'devnet' } });
    }
  } else if (route.query.network === 'devnet') {
    router.push({ path: route.path });
  }
});

const nosana = computed(() => {
  return new Client({
    solana: {
      network:
        network.value === 'devnet'
          ? 'devnet'
          : 'https://try-rpc.mainnet.solana.blockdaemon.tech',
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
