<template>
  <div>
    <Graphs />
    <div class="columns mt-4">
      <div class="column is-6">
        <div class="box">
          <JobList :title="'Latest Jobs'" :jobs="jobs?.slice(0, 5)"></JobList>
          <div class="has-text-right">
            <nuxt-link to="/jobs">All jobs ></nuxt-link>
          </div>
        </div>
      </div>
      <div class="column is-6">
        <div class="box is-flex is-flex-direction-column">
          <h2 class="title is-4">Node Statistics</h2>
          <NodeStats></NodeStats>
          <div class="has-text-right mt-auto">
            <nuxt-link to="/nodes">All nodes ></nuxt-link>
          </div>
        </div>
      </div>
    </div>

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
// useIntervalFn(getJobs, 10000);
</script>

<style lang="scss" scoped>
.box {
  height: 100%;
}
</style>
