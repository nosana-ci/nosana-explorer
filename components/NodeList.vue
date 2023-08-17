<template>
  <div v-if="filteredNodes && !filteredNodes.length">No nodes</div>
  <div class="columns is-mobile is-vcentered">
    <div v-if="nodes && nodes.length > perPage" class="column has-text-right">
      {{ (page - 1) * perPage + 1 }} -
      {{ Math.min(page * perPage, nodes.length) }} of {{ nodes.length }} nodes
    </div>
  </div>

  <div class="table-container">
    <table class="table is-fullwidth is-striped is-hoverable">
      <thead>
        <tr>
          <th></th>
          <th>Address</th>
          <th>Country</th>
          <th>CPU</th>
          <th>Memory</th>
          <th>Audited</th>
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
          :to="`/nodes/${node.authority.toString()}`"
          custom
        >
          <template #default="{ navigate }">
            <tr class="is-clickable" @click="navigate">
              <td
                style="width: 60px; height: 60px; text-align: center"
                class="py-2"
              >
                <img
                  v-if="node.icon"
                  :src="node.icon"
                  style="width: 30px; height: 30px; object-fit: cover"
                  @error="setAltImg"
                />
                <img
                  v-else
                  src="/img/icons/node.svg"
                  style="width: 30px; height: 30px; object-fit: cover"
                />
              </td>
              <td class="is-family-monospace py-2 address">
                {{ node.authority.toString() }}
              </td>
              <td class="py-2">
                <div class="is-size-4" :title="node.country">
                  {{ node.flag ? node.flag : '-' }}
                </div>
              </td>
              <td class="py-2">
                <span class="is-size-6">{{ node.cpu }}</span>
              </td>
              <td class="py-2">
                <span class="is-size-6">{{ node.memory }}</span>
              </td>
              <td class="py-2">
                <img
                  class="mr-2"
                  :src="`/img/icons/status/${
                    node.audited ? 'done' : 'stopped'
                  }.svg`"
                />
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
const perPage: Ref<number> = ref(25);

const filteredNodes = computed(() => {
  if (!props.nodes || !props.nodes.length) return props.nodes;
  const paginatedNodes: Array<any> = props.nodes.slice(
    (page.value - 1) * perPage.value,
    page.value * perPage.value,
  );

  return paginatedNodes;
});

const setAltImg = (e: any) => {
  e.target.src = '/img/icons/node.svg';
};
</script>
<style lang="scss" scoped>
td {
  vertical-align: middle;
}
</style>
