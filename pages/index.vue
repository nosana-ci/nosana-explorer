<template>
  <section class="py-6 section">
    <div class="container">
      <h1 class="title is-2 mb-1">Nosana Explorer</h1>
      <p>Solana {{ nosana.solana.config.network }}</p>
      <div class="control my-5">
        <div class="field has-addons">
          <div class="control is-fullwidth">
            <input
              v-model="searchJob"
              class="input"
              type="text"
              placeholder="Job address"
            />
          </div>
          <div class="control">
            <a class="button is-primary" @click="submitSearch">Search</a>
          </div>
        </div>
      </div>
      <h2 class="subtitle is-4 mt-4 mb-1">Jobs</h2>
      <div v-if="loading">Loading jobs..</div>
      <div v-else-if="jobs">
        <div>Total jobs {{ jobs.length }}</div>
        <JobList :jobs="jobs"></JobList>
      </div>
      <div v-else>Could not load jobs</div>
    </div>
  </section>
</template>

<script setup lang="ts">
const nosana = useSDK();
const loading = ref(false);
const jobs: Ref<Array<any>> | Ref<null> = ref(null);
const searchJob = ref('');
const router = useRouter();

const getJobs = async () => {
  loading.value = true;
  try {
    jobs.value = await nosana.solana.getJobs();
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

function submitSearch() {
  const pattern = /[1-9A-HJ-NP-Za-km-z]{32,44}/;
  if (!pattern.test(searchJob.value)) {
    alert('Not a valid Solana address');
  } else {
    router.push('/job/' + searchJob.value);
  }
}
getJobs();
</script>
