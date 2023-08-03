<template>
  <div class="control my-5">
    <div class="field has-addons">
      <div class="control is-fullwidth">
        <input
          v-model="searchJob"
          class="input"
          type="text"
          placeholder="Job address"
        />
      </div>
      <div class="control">
        <a class="button is-primary" @click="submitSearch">Search</a>
      </div>
    </div>
  </div>
</template>
<script setup language="ts">
const router = useRouter();
const searchJob = ref('');
function submitSearch() {
  const pattern = /[1-9A-HJ-NP-Za-km-z]{32,44}/;
  if (!pattern.test(searchJob.value)) {
    alert('Not a valid Solana address');
  } else {
    router.push('/job/' + searchJob.value);
  }
}
</script>
