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
          ? 'https://rpc-devnet.hellomoon.io/853e30f5-383d-4cc6-a5ee-b5fb4c7a7178'
          : 'https://rpc.hellomoon.io/853e30f5-383d-4cc6-a5ee-b5fb4c7a7178', // https://rpc-public.hellomoon.io
      jobs_address:
        network.value === 'devnet'
          ? 'nosJTmGQxvwXy23vng5UjkTbfv91Bzf9jEuro78dAGR'
          : 'nosJhNRqr2bc9g1nfGDcXXTXvYUmxD4cVwy2pMWhrYM',
      nos_address:
        network.value === 'devnet'
          ? 'devr1BGQndEW5k5zfvG5FsLyZv1Ap73vNgAHcQ9sUVP'
          : 'nosXBVoaCTtYdLvKY6Csb4AC8JCdQKKAaWYtx2ZMoo7',
    },
  });
});
export const useSDK = () => {
  return { nosana, network };
};
