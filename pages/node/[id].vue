<template>
  <div>
    <NuxtLink to="/nodes" class="text-sm">&lt; Back</NuxtLink>
    <div v-if="loading">Loading node..</div>
    <div v-else>
      <div v-if="node">
        <h3 class="subtitle mt-3">{{ nodeId }}</h3>
        <ul>
          <li>
            Location:
            {{ node.flag ? node.flag : node.country }}
          </li>
          <li>Authority: {{ node.authority }}</li>
          <li>Architecture type: {{ node.architecture }} MB</li>
          <li>CPU: {{ node.cpu }} MB</li>
          <li>GPU: {{ node.gpu }} MB</li>
          <li>Memory: {{ node.memory }} MB</li>
          <li>IOPS: {{ node.iops }}</li>
          <li>Storage: {{ node.storage }} MB</li>
          <li>Endpoint: {{ node.endpoint }}</li>
          <li>Version: {{ node.version }}</li>
          <li>
            Audited:
            <img
              :src="`/img/icons/status/${
                node.audited ? 'done' : 'stopped'
              }.svg`"
            />
          </li>
        </ul>
      </div>
      <div v-else>Node not found</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Node } from '@nosana/sdk';
import countries from '@/static/countries.json';

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
    const country = countries.find(
      (c: any) => c.number === node.value.country.toString(),
    );
    node.value.country = country.name;
    node.value.flag = getFlagEmoji(country.code);
  } catch (e) {
    console.error(e);
    node.value = null;
  }
  loading.value = false;
};

const getFlagEmoji = (countryCode: any) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char: any) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

getNode();
</script>
<style lang="scss" scoped></style>
