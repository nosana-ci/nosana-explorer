<template>
  <section class="py-6">
    <div class="container">
      <h1 class="title is-2">Nosana Explorer</h1>
      <p>Solana {{ nosana.solana.config.network }}</p>
      <h2 class="subtitle is-4 mt-4 mb-1">Jobs</h2>
      <div v-if="jobs">Total jobs {{ jobs.length }}</div>
      <div v-if="jobs && jobs.length > perPage" class="mb-3">
        <nav
          class="pagination is-centered"
          role="navigation"
          aria-label="pagination"
          style="width: 400px"
        >
          <button
            :disabled="page < 2"
            class="pagination-previous"
            @click="page--"
          >
            Previous
          </button>
          Page {{ page }} of
          {{ Math.ceil(jobs.length / perPage) }}
          <button
            :disabled="page >= Math.ceil(jobs.length / perPage)"
            class="pagination-next"
            @click="page++"
          >
            Next page
          </button>
        </nav>
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
  </section>
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
