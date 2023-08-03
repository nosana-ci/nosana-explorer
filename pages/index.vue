<template>
  <section class="py-6 section">
    <div class="container">
      <h1 class="title is-2 mb-1">Nosana Explorer</h1>
      <div>
        <div class="select is-small">
          <select v-model="network">
            <option value="devnet">DevNet</option>
            <!-- <option
              value="https://lively-sparkling-shape.solana-mainnet.discover.quiknode.pro/515f35af4d64f05ab7b10cd8cd88f34f9d1ec7d0"
            >
              MainNet
            </option> -->
          </select>
        </div>
      </div>
      <Search />
      <JobList v-if="jobs" :jobs="jobs"></JobList>
      <div v-else-if="loading">Loading jobs..</div>
      <div v-else>Could not load jobs</div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { nosana, network } = useSDK();
const loading = ref(false);
const jobs: Ref<Array<any> | null> = ref(null);

const visibility = useDocumentVisibility();

watch(network, () => {
  jobs.value = null;
  getJobs();
});

watch(visibility, (current, previous) => {
  if (current === 'visible' && previous === 'hidden') {
    if (jobs.value) {
      for (let i = 0; i < jobs.value.length; i++) {
        if (jobs.value[i].new >= 0) {
          jobs.value[i].new = 1;
        }
      }
    }
    getJobs();
  }
});

const getJobs = async () => {
  console.log('retrieving all jobs..');
  loading.value = true;
  try {
    const fetchedJobs: Array<{ pubkey: any; timeStart: any; new?: number }> =
      await nosana.value.solana.getJobs();
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
