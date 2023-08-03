<template>
  <section class="py-6 section">
    <div class="container">
      <NuxtLink to="/" class="text-sm">&lt; Back</NuxtLink>
      <Search />
      <div v-if="loading">Loading job..</div>
      <div>
        <h3 class="subtitle">{{ jobId }}</h3>
        <div v-if="job">
          <ul>
            <li>Node: {{ job.node }}</li>
            <li>Market: {{ job.market }}</li>
            <li>Project: {{ job.project }}</li>
            <li>Payer: {{ job.payer }}</li>
            <li v-if="job.timeStart">Date: {{ job.timeStart }}</li>
            <li v-if="job.timeEnd || job.timeStart">
              Duration:
              <span v-if="job.timeEnd">
                {{ fmtMSS(job.timeEnd - job.timeStart) }}
              </span>
              <span v-else-if="job.timeStart">
                {{ fmtMSS(Math.floor(timestamp / 1000) - job.timeStart) }}
              </span>
            </li>
            <!-- <li>Job: {{ job.ipfsJob }}</li>
            <li>Result: {{ job.ipfsResult }}</li> -->
          </ul>
        </div>
        <div v-else>Job not found</div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { useRoute } from 'vue-router';
import { Job } from '@nosana/sdk';
const { nosana } = useSDK();
const job: Ref<Job | null> = ref(null);
const jobId: Ref<string> = ref('');
const loading = ref(false);

const timestamp = useTimestamp({ interval: 1000 });
const fmtMSS = (s: number) => {
  return (s - (s %= 60)) / 60 + (s > 9 ? 'm ' : 'm 0') + s + 's';
};

export default {
  async setup() {
    const { params } = useRoute();
    jobId.value = String(params.id);
    try {
      loading.value = true;
      job.value = await nosana.value.solana.getJob(jobId.value);
    } catch (e) {
      console.error(e);
      job.value = null;
    }

    try {
      job.value!.ipfsJob = await nosana.value.ipfs.retrieve(job.value!.ipfsJob);
      job.value!.ipfsResult = job.value!.ipfsResult
        ? await nosana.value.ipfs.retrieve(job.value!.ipfsResult)
        : job.value!.ipfsResult;
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
    return { job, jobId, loading, fmtMSS, timestamp };
  },
};
</script>
