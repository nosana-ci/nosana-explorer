<template>
  <section class="py-6 section">
    <div class="container">
      <NuxtLink to="/" class="text-sm">&lt; Back</NuxtLink>
      <Search />
      <div v-if="loading">Loading job..</div>
      <div v-else>
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
          </ul>

          <div class="tabs mt-5">
            <ul>
              <li :class="{ 'is-active': activeTab === 'info' }">
                <a @click.prevent="activeTab = 'info'">Job Info</a>
              </li>
              <li :class="{ 'is-active': activeTab === 'result' }">
                <a @click.prevent="activeTab = 'result'">Job result</a>
              </li>
            </ul>
          </div>
          <div>
            <div
              v-show="activeTab === 'info'"
              class="p-1 py-4 has-background-white-bis"
            >
              <VueJsonPretty :data="ipfsJob" show-icon show-line-number />
            </div>
            <div
              v-show="activeTab === 'result'"
              class="p-1 py-4 has-background-white-bis"
            >
              <div v-if="!ipfsResult || !ipfsResult.results">No results</div>
              <div v-else-if="ipfsResult.results[0] === 'nos/secret'">
                Results are secret
              </div>
              <JobResult v-else :ipfs-result="ipfsResult" :ipfs-job="ipfsJob" />
            </div>
          </div>
        </div>
        <div v-else>Job not found</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Job } from '@nosana/sdk';
import VueJsonPretty from 'vue-json-pretty';
import AnsiUp from 'ansi_up';

const ansi = new AnsiUp();
const { nosana } = useSDK();
const job: Ref<Job | null> = ref(null);
const ipfsJob: Ref<Object | null> = ref(null);
const ipfsResult: Ref<{ results: any } | null> = ref(null);
const jobId: Ref<string> = ref('');
const loading: Ref<boolean> = ref(false);
const activeTab: Ref<string> = ref('info');

const timestamp = useTimestamp({ interval: 1000 });
const fmtMSS = (s: number) => {
  return (s - (s %= 60)) / 60 + (s > 9 ? 'm ' : 'm 0') + s + 's';
};

const getJob = async () => {
  const { params } = useRoute();
  jobId.value = String(params.id);
  try {
    loading.value = true;
    job.value = await nosana.value.solana.getJob(jobId.value);

    try {
      ipfsJob.value = await nosana.value.ipfs.retrieve(job.value!.ipfsJob);
      ipfsResult.value = job.value!.ipfsResult
        ? await nosana.value.ipfs.retrieve(job.value!.ipfsResult)
        : job.value!.ipfsResult;

      if (job.value!.ipfsResult) {
        for (const key in ipfsResult.value!.results) {
          const results = ipfsResult.value!.results[key];
          if (Array.isArray(results)) {
            if (results[1]) {
              if (Array.isArray(results[1]) || Array.isArray(results[2])) {
                const resultsArray = Array.isArray(results[1])
                  ? results[1]
                  : results[2][1];
                if (resultsArray) {
                  for (let i = 0; i < resultsArray.length; i++) {
                    const step = resultsArray[i];
                    if (step.log && Array.isArray(step.log)) {
                      step.log = step.log
                        .reduce((str: any, log: any) => str.concat(log[1]), '')
                        .split('\n')
                        .map((l: any) => [1, ansi.ansi_to_html(l)]);
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log('error when processing ipfs', error);
    }
  } catch (e) {
    console.error(e);
    job.value = null;
  }
  loading.value = false;
};

getJob();
</script>
<style lang="scss" scoped></style>
