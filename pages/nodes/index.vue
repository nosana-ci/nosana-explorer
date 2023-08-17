<template>
  <div>
    <h1 class="title is-5">Nodes</h1>
    <NodeList :nodes="nodes"></NodeList>
    <div v-if="!loadingNodes && !nodes">Could not load nodes</div>
  </div>
</template>
<script setup lang="ts">
const { nodes, getNodes, loadingNodes } = useNodes();
const { network } = useSDK();
const router = useRouter();

if (network.value !== 'devnet') {
  router.push('/');
}

watch(network, () => {
  if (network.value !== 'devnet') {
    router.push('/');
  }
});

// Fetch nodes every 60 seconds
useIntervalFn(getNodes, 60000);
</script>
