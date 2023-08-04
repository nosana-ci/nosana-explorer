<template>
  <div class="control my-5">
    <div class="field has-addons">
      <div class="control is-fullwidth">
        <SimpleTypeahead
          id="typeahead_id"
          v-model="searchJob"
          class="input"
          placeholder="Job address"
          :items="jobs ? jobs : []"
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
<script setup language="ts">
import SimpleTypeahead from 'vue3-simple-typeahead';
const router = useRouter();
const searchJob = ref('');
const props = defineProps({
  jobs: {
    type: Array,
    required: false,
  },
});
const selectItem = (item) => {
  router.push('job/' + item);
};
</script>
