<template>
  <div v-if="filteredNodes && !filteredNodes.length">No nodes</div>
  <div class="columns is-mobile is-vcentered">
    <div class="column">
      <h2 class="subtitle is-4">Nodes</h2>
    </div>
    <div v-if="nodes && nodes.length > perPage" class="column has-text-right">
      {{ (page - 1) * perPage + 1 }} -
      {{ Math.min(page * perPage, nodes.length) }} of {{ nodes.length }} nodes
    </div>
  </div>

  <div class="table-container">
    <table class="table is-fullwidth is-striped is-hoverable">
      <thead>
        <tr>
          <th>Address</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!filteredNodes">
          <td colspan="4">Loading nodes..</td>
        </tr>
        <nuxt-link
          v-for="node in filteredNodes"
          v-else
          :key="node.authority.toString()"
          :to="`/node/${node.authority.toString()}`"
          custom
        >
          <template #default="{ navigate }">
            <tr class="is-clickable" @click="navigate">
              <td class="is-family-monospace">
                {{ node.authority.toString() }}
              </td>
            </tr>
          </template>
        </nuxt-link>
      </tbody>
    </table>
  </div>
  <pagination
    v-if="nodes && nodes.length > perPage"
    v-model="page"
    class="pagination is-centered"
    :total-page="Math.ceil(nodes.length / perPage)"
    :max-page="6"
  >
  </pagination>
</template>

<script setup lang="ts">
import { Node } from '@nosana/sdk';
const props = defineProps({
  nodes: {
    type: Array<Node>,
    default: undefined,
  },
});

const page: Ref<number> = ref(1);
const perPage: Ref<number> = ref(2);

const filteredNodes = computed(() => {
  if (!props.nodes || !props.nodes.length) return props.nodes;
  const paginatedNodes = props.nodes.slice(
    (page.value - 1) * perPage.value,
    page.value * perPage.value,
  );
  return paginatedNodes;
});
</script>
