<template>
  <div>
    <Graphs />
    <div class="columns mt-4 is-multiline">
      <div class="column is-6">
        <div class="box is-flex is-flex-direction-column">
          <JobList
            :loading-jobs="loadingJobs"
            title="Latest Inferences"
            :jobs="jobs"
            :limit="5"
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
          <h2 class="title is-5">Statistics</h2>
          <NodeStats></NodeStats>
          <!-- <div class="has-text-right mt-auto pt-2">
            <nuxt-link to="/nodes" class="button is-white">
              <span>All nodes</span>
              <span class="icon"> &#8250; </span>
            </nuxt-link>
          </div> -->
        </div>
      </div>
      <div class="column is-6">
        <div class="box is-flex is-flex-direction-column">
          <h2 class="title is-5">Test Grid Markets</h2>
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
const { getMarkets, markets } = useMarkets();
const { network } = useSDK();

// Fetch jobs when we switch back to tab
const visibility = useDocumentVisibility();
watch(visibility, (current, previous) => {
  if (current === 'visible' && previous === 'hidden') {
    getJobs();
  }
});
watch(network, () => {
  getJobs();
  getMarkets();
});

if (!jobs.value) {
  getJobs();
}
if (!markets.value) {
  getMarkets();
}

// Fetch jobs every 30 seconds
useIntervalFn(getJobs, 30000);

// Fetch markets every 30 seconds
useIntervalFn(getMarkets, 30000);
</script>

<style lang="scss" scoped>
.box {
  height: 100%;
}
</style>
