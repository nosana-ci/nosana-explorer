const { nosana } = useSDK();
const ipfsList: Ref<any> = useLocalStorage('ipfs', {});

const getIpfs = async (hash: string) => {
  try {
    let ipfsData = ipfsList.value[hash];
    if (!ipfsData) {
      console.log('retrieving', hash);
      ipfsData = await nosana.value.ipfs.retrieve(hash);
      ipfsList.value[hash] = ipfsData;
    }
    return ipfsData
      ? (JSON.parse(JSON.stringify(ipfsData)) as Object)
      : ipfsData;
  } catch (e) {
    console.error(e);
  }
};

export const useIpfs = () => {
  return { ipfsList, getIpfs };
};
