<template>
  <section class="py-6 section">
    <div class="container">
      <div>
        <NuxtLink to="/" class="text-sm">&lt; Back</NuxtLink>
        <br />
        Job ID: {{ jobId }}
        <div>job: {{ job }}</div>
      </div>
    </div>
  </section>
</template>

<script>
import { useRoute } from 'vue-router';
const nosana = useSDK();
const job = ref();
const jobId = ref();

export default {
  async setup() {
    const { params } = useRoute();
    console.log('params id', params.id);
    jobId.value = params.id;
    try {
      job.value = await nosana.solana.getJob(jobId.value);
    } catch (e) {
      console.error(e);
    }
    return { job };
  },
};
</script>
