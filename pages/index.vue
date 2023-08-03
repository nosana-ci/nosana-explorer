<template>
  <section class="py-6 section">
    <div class="container">
      <h1 class="title is-2">Nosana Explorer</h1>
      <p>Solana {{ nosana.solana.config.network }}</p>
      <h2 class="subtitle is-4 mt-4 mb-1">Jobs</h2>
      <div v-if="loading">Loading jobs..</div>
      <div v-else-if="jobs">
        <div>Total jobs {{ jobs.length }}</div>
        <JobList :jobs="jobs"></JobList>
      </div>
      <div v-else>Could not load jobs</div>
    </div>
  </section>
</template>

<script setup lang="ts">
const nosana = useSDK();
const loading = ref(false);
const jobs: Ref<Array<any> | null> = ref(null);

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
