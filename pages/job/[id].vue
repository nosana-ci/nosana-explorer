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
              <VueJsonPretty :data="job.ipfsJob" show-icon show-line-number />
            </div>
            <div
              v-show="activeTab === 'result'"
              class="p-1 py-4 has-background-white-bis"
            >
              <div v-if="!job.ipfsResult || !job.ipfsResult.results">
                No results
              </div>
              <div v-else-if="job.ipfsResult.results[0] === 'nos/secret'">
                Results are secret
              </div>
              <div
                v-for="jobName in (job.ipfsJob.ops.find(
                  (j) => j.id === 'checkout',
                )
                  ? []
                  : ['checkout']
                ).concat(job.ipfsJob.ops.map((j) => j.name || j.id))"
                v-else
                :key="jobName"
                style="counter-reset: line"
              >
                <template
                  v-if="
                    job.ipfsResult &&
                    job.ipfsResult.results &&
                    job.ipfsResult.results[jobName] &&
                    !jobName.endsWith('-volume')
                  "
                >
                  <div class="row-count has-text-link">
                    <span>- Executed step '{{ jobName }}'</span>
                  </div>
                  <div
                    v-if="
                      typeof job.ipfsResult.results[jobName][1] === 'string' &&
                      (!job.ipfsResult.results[jobName][2] ||
                        (Array.isArray(job.ipfsResult.results[jobName][2]) &&
                          job.ipfsResult.results[jobName][2].length === 0))
                    "
                    class="has-text-danger row-count"
                  >
                    <span>{{ job.ipfsResult.results[jobName][1] }}</span>
                  </div>
                  <div
                    v-for="(step, index) in job.ipfsResult.results[
                      jobName
                    ][2] && Array.isArray(job.ipfsResult.results[jobName][2])
                      ? job.ipfsResult.results[jobName][2][1]
                      : job.ipfsResult.results[jobName][1]"
                    v-else
                    :key="index"
                  >
                    <span
                      v-if="
                        typeof job.ipfsResult.results[jobName][1] ===
                          'string' &&
                        job.ipfsResult.results[jobName][2] &&
                        index === 0
                      "
                      class="has-text-danger row-count"
                    >
                      {{ job.ipfsResult.results[jobName][1] }}</span
                    >
                    <div
                      v-if="step.cmd && false"
                      class="row-count"
                      :class="{
                        'has-text-accent': !step.status,
                        'has-text-danger': step.status,
                      }"
                    >
                      <span v-if="step.cmd.cmd" class="has-text-weight-bold">
                        <span v-if="!step.cmd.cmd.startsWith('sh -c')"
                          >$ {{ step.cmd.cmd }}</span
                        >
                        <i v-else class="has-text-grey"
                          >executing through sh -c</i
                        >
                      </span>
                      <span v-else class="has-text-weight-bold"
                        >$ {{ step.cmd }}</span
                      >
                    </div>
                    <div v-if="step.log && Array.isArray(step.log)">
                      <div
                        v-for="(log, ik) in step.log"
                        :key="ik"
                        class="row-count"
                        :class="{
                          'has-text-danger': log[0] === 2 && step.status,
                        }"
                      >
                        <span class="pre" v-html="log[1].slice(0, 10000)" />
                        <!-- {{ convert.toHtml(log[1].slice(0, 10000)) }} -->
                      </div>
                      <div v-if="step.error" class="row-count has-text-danger">
                        <span class="has-text-weight-bold">{{
                          step.error
                        }}</span>
                      </div>
                      <div v-if="step.status" class="row-count has-text-danger">
                        <span class="has-text-weight-bold"
                          >Exited with code {{ step.status }}</span
                        >
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div v-else>Job not found</div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { useRoute } from 'vue-router';
import { Job } from '@nosana/sdk';
import VueJsonPretty from 'vue-json-pretty';
import AnsiUp from 'ansi_up';

const ansi = new AnsiUp();
const { nosana } = useSDK();
const job: Ref<Job | null> = ref(null);
const jobId: Ref<string> = ref('');
const loading: Ref<boolean> = ref(false);
const activeTab: Ref<string> = ref('info');

const timestamp = useTimestamp({ interval: 1000 });
const fmtMSS = (s: number) => {
  return (s - (s %= 60)) / 60 + (s > 9 ? 'm ' : 'm 0') + s + 's';
};

export default {
  components: {
    VueJsonPretty,
  },
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

      if (job.value!.ipfsResult) {
        for (const key in job.value!.ipfsResult.results) {
          const results = job.value!.ipfsResult.results[key];
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
                        .reduce((str, log) => str.concat(log[1]), '')
                        .split('\n')
                        .map((l) => [1, ansi.ansi_to_html(l)]);
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
    return { job, jobId, loading, fmtMSS, timestamp, activeTab };
  },
};
</script>
<style lang="scss" scoped>
.pre {
  white-space: pre-wrap;
}
.row-count {
  word-break: break-word;
  max-width: 85%;
  padding-left: 40px;
  &:before {
    counter-increment: line;
    font-family: $family-monospace;
    font-weight: normal;
    content: counter(line);
    display: inline-block;
    padding: 0 0.5em;
    margin-right: 0.5em;
    color: $grey !important;
    min-width: 50px;
    text-align: right;
    margin-left: -62px;
  }
  &.has-text-danger:before {
    color: $red !important;
  }
}
</style>
