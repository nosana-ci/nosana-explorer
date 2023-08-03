<template>
  <section class="py-6 section">
    <div class="container">
      <Search />
      <div v-if="loading">Loading job..</div>
      <div>
        <NuxtLink to="/" class="text-sm">&lt; Back</NuxtLink>
        <br />
        <div v-if="job">
          <div>job: {{ job }}</div>
        </div>
        <div v-else>Job not found</div>
      </div>
    </div>
  </section>
</template>

<script>
import { useRoute } from 'vue-router';
const nosana = useSDK();
const job = ref();
const jobId = ref();
const loading = ref(false);

export default {
  async setup() {
    const { params } = useRoute();
    console.log('params id', params.id);
    jobId.value = params.id;
    try {
      loading.value = true;
      job.value = await nosana.solana.getJob(jobId.value);
    } catch (e) {
      console.error(e);
      job.value = null;
    }
    loading.value = false;
    return { job };
  },
};
</script>
