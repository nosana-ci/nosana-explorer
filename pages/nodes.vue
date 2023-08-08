<template>
  <section class="section">
    <div class="container">
      <h1 class="title mt-5 mb-6">Nodes</h1>
      <NodeList :nodes="nodes"></NodeList>
    </div>
  </section>
</template>
<script setup lang="ts">
const { nosana, network } = useSDK();
const loading = ref(false);
const nodes: Ref<Array<any> | undefined> = ref(undefined);

const visibility = useDocumentVisibility();

watch(network, () => {
  nodes.value = undefined;
  getNodes();
});

watch(visibility, (current, previous) => {
  if (current === 'visible' && previous === 'hidden') {
    getNodes();
  }
});

const getNodes = async () => {
  console.log('retrieving all nodes..');
  loading.value = true;
  try {
    nodes.value = await nosana.value.nodes.getAll();
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

getNodes();
</script>
