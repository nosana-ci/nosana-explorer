const { nosana } = useSDK();
const ipfsList: Ref<any> = useLocalStorage('ipfs', {});

const getIpfs = async (hash: string) => {
  try {
    if (!ipfsList.value[hash]) {
      ipfsList.value[hash] = await nosana.value.ipfs.retrieve(hash);
    }
    return JSON.parse(JSON.stringify(ipfsList.value[hash])) as Object;
  } catch (e) {
    console.error(e);
  }
};

export const useIpfs = () => {
  return { ipfsList, getIpfs };
};
