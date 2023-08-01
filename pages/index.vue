<template>
  <section class="py-6 section">
    <div class="container">
      <h1 class="title is-2">Nosana Explorer</h1>
      <p>Solana {{ nosana.solana.config.network }}</p>
      <h2 class="subtitle is-4 mt-4 mb-1">Jobs</h2>
      <div v-if="jobs">Total jobs {{ jobs.length }}</div>
      <pagination
        v-if="jobs && jobs.length > perPage"
        v-model="page"
        class="pagination is-centered"
        :total-page="Math.ceil(jobs.length / perPage)"
        :max-page="6"
      >
        <template #prev-button="{ changePage }">
          <a
            class="pagination-previous"
            :disabled="page < 2 ? true : null"
            @click="changePage('-')"
            >Previous</a
          >
        </template>
        <template #default="{ pagination, changePage }">
          <ul class="pagination-list">
            <li v-for="i in pagination" :key="i">
              <span v-if="i === '...'" class="pagination-ellipsis"
                >&hellip;</span
              >
              <a
                v-else
                class="pagination-link"
                :class="page == i ? 'is-current has-text-weight-bold' : ''"
                @click="changePage(i)"
                >{{ i }}</a
              >
            </li>
          </ul>
        </template>
        <template #next-button="{ changePage }">
          <a
            :disabled="page >= Math.ceil(jobs.length / perPage) ? true : null"
            class="pagination-next"
            @click="changePage('+')"
            >Next</a
          >
        </template>
      </pagination>
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
