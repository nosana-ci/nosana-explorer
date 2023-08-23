const { nosana } = useSDK();
const ipfsList: Ref<any> = useLocalStorage('ipfs', {});

const getIpfs = async (hash: string) => {
  try {
    if (ipfsList.value[hash]) {
      return JSON.parse(ipfsList.value[hash]) as Object;
    }
    ipfsList.value[hash] = JSON.stringify(
      await nosana.value.ipfs.retrieve(hash),
    );
    return JSON.parse(ipfsList.value[hash]) as Object;
  } catch (e) {
    console.error(e);
  }
};

export const useIpfs = () => {
  return { ipfsList, getIpfs };
};
