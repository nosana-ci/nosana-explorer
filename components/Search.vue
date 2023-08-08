<template>
  <div class="control my-5">
    <div class="field has-addons">
      <div class="control is-fullwidth">
        <SimpleTypeahead
          id="typeahead_id"
          v-model="searchJob"
          class="input"
          placeholder="Job address"
          :items="jobs ? jobs!.map((a) => a.pubkey.toString()) : []"
          :min-input-length="2"
          @selectItem="selectItem"
        >
        </SimpleTypeahead>
      </div>
      <div class="control">
        <a class="button is-primary" @click="submitSearch">Search</a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import SimpleTypeahead from 'vue3-simple-typeahead';
const router = useRouter();
const searchJob = ref('');
const jobs = useJobs();
const selectItem = (item: string) => {
  router.push('/job/' + item);
};
</script>
