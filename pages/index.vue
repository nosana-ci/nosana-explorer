<template>
  <div>
    <h1>Nosana Explorer</h1>
    Solana {{ nosana.solana.config.network }}
    <h2>Jobs</h2>
    <div v-if="jobs">Total jobs {{ jobs.length }}</div>
    <div v-if="jobs && jobs.length > perPage">
      <button :disabled="page < 2" @click="page--">Prev</button> Page
      {{ page }} of
      {{ Math.ceil(jobs.length / perPage) }}
      <button
        :disabled="page >= Math.ceil(jobs.length / perPage)"
        @click="page++"
      >
        Next
      </button>
    </div>
    <div v-if="loading">Loading jobs..</div>
    <div v-else-if="filteredJobs">
      <div v-for="(job, i) in filteredJobs" :key="job">
        <p>
          <a
            :href="`https://explorer.solana.com/address/${job}/anchor-account?cluster=devnet`"
            target="_blank"
          >
            {{ job }} </a
          ><br />
          <span v-if="jobData[i]">
            {{ jobData[i] }}
          </span>
          <span v-else> Loading job data.. </span>
        </p>
      </div>
      <div v-if="!filteredJobs.length">No jobs</div>
    </div>
    <div v-else>Could not load jobs</div>
  </div>
</template>

<script setup lang="ts">
const nosana = useSDK();
const loading = ref(false);
const jobs: Ref<Array<any>> | Ref<null> = ref(null);
const jobData = ref([]);

const page: Ref<number> = ref(1);
const perPage: Ref<number> = ref(10);

const getJobs = async () => {
  loading.value = true;
  try {
    jobs.value = await nosana.solana.getJobs();
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

const filteredJobs = computed(() => {
  loading.value = true;
  if (!jobs.value || !jobs.value.length) return jobs.value;
  const paginatedJobs = jobs.value.slice(
    (page.value - 1) * perPage.value,
    page.value * perPage.value,
  );
  const filteredJobs = paginatedJobs.map((job) => job.pubkey);
  getJobData(filteredJobs);
  loading.value = false;
  return filteredJobs;
});
const getJobData = async (jobs) => {
  jobData.value = {};
  jobData.value = await nosana.solana.getMultipleJobs(jobs);
};
getJobs();
</script>
