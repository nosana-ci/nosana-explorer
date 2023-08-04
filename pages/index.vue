<template>
  <section class="py-6 section">
    <div class="container">
      <h1 class="title is-2 mb-1" @click="getJobs">Nosana Explorer</h1>
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
      <JobList :jobs="jobs"></JobList>
      <div v-if="!loading && !jobs">Could not load jobs</div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { nosana, network } = useSDK();
const loading = ref(false);
const jobs: Ref<Array<any> | undefined> = ref(undefined);

const visibility = useDocumentVisibility();

watch(network, () => {
  jobs.value = undefined;
  getJobs();
});

watch(visibility, (current, previous) => {
  if (current === 'visible' && previous === 'hidden') {
    getJobs();
  }
});

const getJobs = async () => {
  console.log('retrieving all jobs..');
  loading.value = true;
  try {
    jobs.value = await nosana.value.solana.getJobs();
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

getJobs();
useIntervalFn(getJobs, 10000);
</script>
