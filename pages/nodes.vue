<template>
  <div>
    <h1 class="title is-4">Nodes</h1>
    <NodeList :nodes="nodes"></NodeList>
    <div v-if="!loadingNodes && !nodes">Could not load nodes</div>
  </div>
</template>
<script setup lang="ts">
const { nodes, getNodes, loadingNodes } = useNodes();

// Fetch nodes every 60 seconds
useIntervalFn(getNodes, 60000);
</script>
