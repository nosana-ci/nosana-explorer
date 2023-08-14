const { nosana } = useSDK();
const ipfsList: Ref<{ [key: string]: Object }> = ref({});

const getIpfs = async (hash: string) => {
  try {
    if (ipfsList.value[hash]) {
      return ipfsList.value[hash] as Object;
    }
    console.log('getting ipfs..');
    ipfsList.value[hash] = await nosana.value.ipfs.retrieve(hash);
    return ipfsList.value[hash] as Object;
  } catch (e) {
    console.error(e);
  }
};

export const useIpfs = () => {
  return { ipfsList, getIpfs };
};
