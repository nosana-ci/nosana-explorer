<template>
  <div class="box">
    <div v-if="loading">Loading job..</div>
    <div v-else>
      <div v-if="job">
        <div
          class="is-flex is-align-items-center is-justify-content-space-between mb-3"
        >
          <h3 class="title is-5 address is-family-monospace my-0">
            {{ jobId }}
          </h3>
          <JobStatus
            class="ml-2"
            :status="jobStatus ? jobStatus : job.state"
          ></JobStatus>
        </div>

        <table class="table is-fullwidth is-striped">
          <tbody>
            <tr>
              <td>Node</td>
              <td>
                <nuxt-link
                  class="address is-family-monospace"
                  :to="`/nodes/${job.node}`"
                  >{{ job.node }}</nuxt-link
                >
              </td>
            </tr>
            <tr>
              <td>Market</td>
              <td>
                <nuxt-link
                  :to="`/markets/${job.market}`"
                  class="address is-family-monospace"
                  >{{ job.market }}</nuxt-link
                >
              </td>
            </tr>
            <tr>
              <td>Project</td>
              <td>
                <nuxt-link
                  class="address is-family-monospace"
                  :to="`/address/${job.project}`"
                  >{{ job.project }}</nuxt-link
                >
              </td>
            </tr>
            <tr>
              <td>Price</td>
              <td>{{ job.price / 1e6 }} NOS</td>
            </tr>
            <tr>
              <td>Started</td>
              <td>
                <span v-if="job.timeStart">
                  {{
                    useDateFormat(
                      new Date(job.timeStart * 1000),
                      'YYYY-MM-DD HH:mm:ss',
                    ).value
                  }}
                  <UseTimeAgo
                    v-slot="{ timeAgo }"
                    :time="new Date(job.timeStart * 1000)"
                  >
                    ({{ timeAgo }})
                  </UseTimeAgo>
                </span>
                <span v-else>-</span>
              </td>
            </tr>
            <tr>
              <td>Duration</td>
              <td>
                <span v-if="job.timeEnd">
                  {{ fmtMSS(job.timeEnd - job.timeStart) }}
                </span>
                <span v-else-if="job.timeStart">
                  {{ fmtMSS(Math.floor(timestamp / 1000) - job.timeStart) }}
                </span>
                <span v-else> - </span>
              </td>
            </tr>
            <tr>
              <td>Type</td>
              <td>
                <JobType
                  v-if="ipfsJob"
                  :ipfs="ipfsJob"
                  :text="true"
                  class="ml-1"
                />
              </td>
            </tr>
            <tr>
              <td>Source</td>
              <td
                v-if="
                  ipfsJob.state &&
                  ipfsJob.state['nosana/job-type'] &&
                  (ipfsJob.state['nosana/job-type'] === 'Github' ||
                    ipfsJob.state['nosana/job-type'] === 'github-flow')
                "
              >
                <a
                  :href="
                    ipfsJob.state['input/repo'].replace('.git', '') +
                    '/commit/' +
                    ipfsJob.state['input/commit-sha']
                  "
                  target="_blank"
                >
                  {{ ipfsJob.state['input/commit-sha'] }}
                </a>
              </td>
              <td v-else>Secret</td>
            </tr>
          </tbody>
        </table>

        <div class="tabs mt-5">
          <ul>
            <li :class="{ 'is-active': activeTab === 'result' }">
              <a @click.prevent="activeTab = 'result'">Result</a>
            </li>
            <li :class="{ 'is-active': activeTab === 'info' }">
              <a @click.prevent="activeTab = 'info'">JSON Flow</a>
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
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Job } from '@nosana/sdk';
import VueJsonPretty from 'vue-json-pretty';
import { UseTimeAgo } from '@vueuse/components';

import AnsiUp from 'ansi_up';

const ansi = new AnsiUp();
const { nosana, network } = useSDK();
const job: Ref<Job | null> = ref(null);
const ipfsJob: Ref<{ [key: string]: any }> = ref({});
const ipfsResult: Ref<{ [key: string]: any }> = ref({});
const { params } = useRoute();
const jobId: Ref<string> = ref(String(params.id) || '');
const loading: Ref<boolean> = ref(false);
const activeTab: Ref<string> = ref('result');
const jobStatus: Ref<string | null> = ref(null);
const { getIpfs } = useIpfs();

const timestamp = useTimestamp({ interval: 1000 });
const fmtMSS = (s: number) => {
  return (s - (s %= 60)) / 60 + (s > 9 ? 'm:' : 'm:0') + s + 's';
};

watch(network, () => {
  job.value = null;
  getJob();
});

const getJob = async () => {
  try {
    loading.value = true;
    job.value = await nosana.value.jobs.get(jobId.value);

    try {
      ipfsJob.value = await getIpfs(job.value!.ipfsJob);
      ipfsResult.value = job.value!.ipfsResult
        ? await getIpfs(job.value!.ipfsResult)
        : job.value!.ipfsResult;

      if (ipfsResult.value && typeof ipfsResult.value !== 'string') {
        for (const key in ipfsResult.value!.results) {
          const results = ipfsResult.value!.results[key];
          if (
            (results && results[0] && results[0].exit) ||
            (results &&
              results[0] &&
              (results[0].includes('error') || results[0].includes('failed')))
          ) {
            jobStatus.value = 'FAILED';
          }

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
