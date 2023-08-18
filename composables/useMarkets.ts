const markets: Ref<Array<any> | undefined> = ref(undefined);

const { nosana, network } = useSDK();

watch(network, () => {
  markets.value = undefined;
  getMarkets();
});

const loadingMarkets = ref(false);

const getMarkets = async () => {
  console.log('retrieving all markets..');
  loadingMarkets.value = true;
  try {
    markets.value = await nosana.value.jobs.allMarkets();
  } catch (e) {
    console.error(e);
  }
  loadingMarkets.value = false;
};
getMarkets();

export const useMarkets = () => {
  return { markets, getMarkets, loadingMarkets };
};
