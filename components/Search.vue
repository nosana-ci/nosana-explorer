<template>
  <div class="control mb-4">
    <div class="field has-addons">
      <div class="control is-fullwidth dropdown is-active">
        <input
          v-model="address"
          type="text"
          class="input"
          placeholder="Address"
        />
        <div
          v-if="searchItems.length"
          class="dropdown-menu is-active is-fullwidth"
          role="menu"
        >
          <div class="dropdown-content has-background-white-bis">
            <a
              v-for="item in searchItems"
              :key="item"
              class="dropdown-item px-4 py-2 is-size-6 is-flex is-justify-content-space-between"
              @click="selectItem(item), (address = '')"
            >
              {{ item.value }}
              <span class="is-capitalized has-text-grey-light">{{
                item.type
              }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Node } from '@nosana/sdk';
const router = useRouter();
const address = ref('');
const { jobs } = useJobs();
const { nodes } = useNodes();
const items: Ref<Array<any>> = ref([]);

const selectItem = (item: { type: string; value: string }) => {
  router.push(`/${item.type}/${item.value}`);
};

const searchItems = computed(() => {
  if (address.value === '' || (!jobs.value && !nodes.value)) {
    return [];
  }

  // combine jobs & nodes in one list
  items.value = jobs
    .value!.map((a: any) => {
      return { value: a.pubkey.toString(), type: 'job' };
    })
    .concat(
      nodes.value
        ? nodes.value!.map((a: Node) => {
            return { value: a.authority.toString(), type: 'node' };
          })
        : [],
    );

  let matches = 0;
  return items.value!.filter((item: any) => {
    if (
      item.value
        .toString()
        .toLowerCase()
        .includes(address.value.toLowerCase()) &&
      matches < 8
    ) {
      matches++;
      return item;
    } else {
      return false;
    }
  });
});
</script>
