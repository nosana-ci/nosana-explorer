<template>
  <div>
    <h1>Nosana Explorer</h1>
    Solana {{ nosana.solana.config.network }}
    <h2>Jobs</h2>
    <div v-if="loading">Loading jobs..</div>
    <div v-else-if="jobs">
      <div v-for="job in jobs" :key="job.pubkey">- {{ job.pubkey }}</div>
      <div v-if="!jobs.length">No jobs</div>
    </div>
    <div v-else>Could not load jobs</div>
  </div>
</template>

<script setup lang="ts">
const nosana = useSDK();
const loading = ref(false);
const jobs: Ref<Array<any>> | Ref<null> = ref(null);

const getJobs = async () => {
  loading.value = true;
  try {
    jobs.value = await nosana.solana.getJobs();
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};
getJobs();
</script>
