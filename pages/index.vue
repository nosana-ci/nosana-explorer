<template>
  <section class="py-6 section">
    <div class="container">
      <h1 class="title is-2 mb-1">Nosana Explorer</h1>
      <p>Solana {{ nosana.solana.config.network }}</p>
      <Search />
      <h2 class="subtitle is-4 mt-4 mb-1">Jobs</h2>
      <div v-if="jobs">
        <div>Total jobs {{ jobs.length }}</div>
        <JobList :jobs="jobs"></JobList>
      </div>
      <div v-else-if="loading">Loading jobs..</div>
      <div v-else>Could not load jobs</div>
    </div>
  </section>
</template>

<script setup lang="ts">
const nosana = useSDK();
const loading = ref(false);
const jobs: Ref<Array<any> | null> = ref(null);

const visibility = useDocumentVisibility();

watch(visibility, (current, previous) => {
  if (current === 'visible' && previous === 'hidden') {
    if (jobs.value) {
      for (let i = 0; i < jobs.value.length; i++) {
        if (jobs.value[i].new === 0) {
          jobs.value[i].new = 1;
        }
      }
    }
  }
});

const getJobs = async () => {
  loading.value = true;
  try {
    const fetchedJobs: Array<{ pubkey: any; timeStart: any; new?: number }> =
      await nosana.solana.getJobs();
    if (jobs.value) {
      for (let i = 0; i < fetchedJobs.length; i++) {
        const oldJob = jobs.value.find((job) => {
          return job.pubkey.toString() === fetchedJobs[i].pubkey.toString();
        });
        if (!oldJob || oldJob.new === 0) {
          fetchedJobs[i].new = visibility.value === 'visible' ? 1 : 0;
        }
      }
    }
    jobs.value = fetchedJobs;
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

getJobs();
useIntervalFn(getJobs, 10000);
</script>
