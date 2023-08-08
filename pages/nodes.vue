<template>
  <div>
    <h1 class="title is-4">Nodes</h1>
    <NodeList :nodes="nodes"></NodeList>
    <div v-if="!loadingNodes && !nodes">Could not load nodes</div>
  </div>
</template>
<script setup lang="ts">
const { network } = useSDK();
const { nodes, getNodes, loadingNodes } = useNodes();

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

getNodes();
</script>
