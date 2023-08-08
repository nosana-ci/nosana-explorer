<template>
  <div>
    <NuxtLink to="/nodes" class="text-sm">&lt; Back</NuxtLink>
    <div v-if="loading">Loading node..</div>
    <div v-else>
      <div v-if="node">
        <h3 class="subtitle mt-3">{{ nodeId }}</h3>
        <ul>
          <li>Authority: {{ node.authority }}</li>
          <li>Architecture type: {{ node.architecture }} MB</li>
          <li>CPU: {{ node.cpu }} MB</li>
          <li>GPU: {{ node.gpu }} MB</li>
          <li>Memory: {{ node.memory }} MB</li>
          <li>IOPS: {{ node.iops }}</li>
          <li>Storage: {{ node.storage }} MB</li>
          <li>Endpoint: {{ node.endpoint }}</li>
          <li>Version: {{ node.version }}</li>
        </ul>
      </div>
      <div v-else>Node not found</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Node } from '@nosana/sdk';

const { nosana } = useSDK();
const node: Ref<Node | null> = ref(null);
const nodeId: Ref<string> = ref('');
const loading: Ref<boolean> = ref(false);

const getNode = async () => {
  const { params } = useRoute();
  nodeId.value = String(params.id);
  try {
    loading.value = true;
    node.value = await nosana.value.nodes.get(nodeId.value);
  } catch (e) {
    console.error(e);
    node.value = null;
  }
  loading.value = false;
};

getNode();
</script>
<style lang="scss" scoped></style>
