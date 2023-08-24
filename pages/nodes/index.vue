<template>
  <div class="box">
    <h1 class="title is-5">Nodes</h1>
    <NodeList :nodes="nodes"></NodeList>
    <div v-if="!loadingNodes && !nodes">Could not load nodes</div>
  </div>
</template>
<script setup lang="ts">
const { nodes, getNodes, loadingNodes } = useNodes();

// Fetch nodes every 60 seconds
useIntervalFn(getNodes, 60000);
</script>
