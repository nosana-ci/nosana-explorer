<template>
  <div class="control mb-4">
    <div class="field has-addons">
      <div class="control is-fullwidth">
        <SimpleTypeahead
          id="typeahead_id"
          v-model="searchAddress"
          class="input"
          placeholder="Address"
          :items="
            jobs
              ? jobs!
                  .map((a: any) => a.pubkey.toString())
                  .concat(
                    nodes ? nodes!.map((a: Node) => a.address.toString()) : [],
                  )
              : []
          "
          :min-input-length="2"
          @selectItem="selectItem"
        >
        </SimpleTypeahead>
      </div>
      <div class="control">
        <a class="button is-primary" @click="selectItem(searchAddress)"
          >Search</a
        >
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Node } from '@nosana/sdk';
import SimpleTypeahead from 'vue3-simple-typeahead';
const router = useRouter();
const searchAddress = ref('');
const { jobs } = useJobs();
const { nodes } = useNodes();

const selectItem = (item: string) => {
  if (nodes.value!.find((e: Node) => e.address.toString() === item)) {
    router.push('/node/' + item);
  } else {
    router.push('/job/' + item);
  }
};
</script>
