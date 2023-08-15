<template>
  <div>
    <Stats />
    <JobList :jobs="jobs"></JobList>
    <div v-if="!loadingJobs && !jobs">Could not load jobs</div>
  </div>
</template>

<script setup lang="ts">
const { jobs, getJobs, loadingJobs } = useJobs();

// Fetch jobs when we switch back to tab
const visibility = useDocumentVisibility();
watch(visibility, (current, previous) => {
  if (current === 'visible' && previous === 'hidden') {
    getJobs();
  }
});

// Fetch jobs every 10 seconds
useIntervalFn(getJobs, 10000);
</script>
