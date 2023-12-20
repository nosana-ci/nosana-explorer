<template>
  <div>
    <div class="box">
      <JobList :jobs="jobs" :loading-jobs="loadingJobs"></JobList>
    </div>
    <div v-if="!loading && !jobs">Could not load jobs</div>
  </div>
</template>

<script setup lang="ts">
const { network } = useSDK();
const loading: Ref<boolean> = ref(false);
const { jobs, loadingJobs, getJobs } = useJobs();

// Fetch jobs when we switch back to tab
const visibility = useDocumentVisibility();
watch(visibility, (current, previous) => {
  if (current === 'visible' && previous === 'hidden') {
    getJobs();
  }
});
watch(network, () => {
  getJobs();
});

if (!jobs.value) {
  getJobs();
}

// Fetch jobs every 30 seconds
useIntervalFn(getJobs, 30000);
</script>