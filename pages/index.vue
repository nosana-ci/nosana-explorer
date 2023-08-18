<template>
  <div>
    <Graphs />
    <div class="columns mt-4 is-multiline">
      <div class="column is-6">
        <div class="box is-flex is-flex-direction-column">
          <JobList
            :title="'Latest Jobs'"
            :jobs="jobs?.slice(0, 5)"
            :small="true"
          ></JobList>
          <div class="has-text-right mt-auto pt-2">
            <nuxt-link to="/jobs" class="button is-white">
              <span>All jobs</span>
              <span class="icon"> &#8250; </span>
            </nuxt-link>
          </div>
        </div>
      </div>
      <div class="column is-6">
        <div class="box is-flex is-flex-direction-column">
          <h2 class="title is-5">Node Statistics</h2>
          <NodeStats></NodeStats>
          <div class="has-text-right mt-auto pt-2">
            <nuxt-link to="/nodes" class="button is-white">
              <span>All nodes</span>
              <span class="icon"> &#8250; </span>
            </nuxt-link>
          </div>
        </div>
      </div>
      <div class="column is-6">
        <div class="box is-flex is-flex-direction-column">
          <h2 class="title is-5">Market Queues</h2>
          <MarketQueues></MarketQueues>
          <div class="has-text-right mt-auto pt-2">
            <nuxt-link to="/markets" class="button is-white">
              <span>All markets</span>
              <span class="icon"> &#8250; </span>
            </nuxt-link>
          </div>
        </div>
      </div>
      <div class="column is-6">
        <div class="box is-flex is-flex-direction-column">
          <h2 class="title is-5">Links</h2>
          <Links></Links>
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
