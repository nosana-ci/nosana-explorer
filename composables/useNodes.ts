const nodes: Ref<Array<any> | undefined> = ref(undefined);

const { nosana, network } = useSDK();

watch(network, () => {
  nodes.value = undefined;
  getNodes();
});

const loadingNodes = ref(false);

const getNodes = async () => {
  console.log('retrieving all nodes..');
  loadingNodes.value = true;
  try {
    nodes.value = await nosana.value.nodes.getAll();
  } catch (e) {
    console.error(e);
  }
  loadingNodes.value = false;
};

export const useNodes = () => {
  getNodes();
  return { nodes, getNodes, loadingNodes };
};
