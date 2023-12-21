<template>
  <div class="box">
    <div v-if="job">
      <div
        class="is-flex is-align-items-center is-justify-content-space-between mb-4"
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
                :to="`/address/${job.node}`"
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
                >{{
                  testgridMarkets[job.market]
                    ? testgridMarkets[job.market].name
                    : job.market
                }}</nuxt-link
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
            <td>{{ job.price / 1e6 }} NOS/s</td>
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
            <td>Trigger</td>
            <td>
              <JobTrigger
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
                ipfsJob &&
                ipfsJob.state &&
                ipfsJob.state['nosana/job-type'] &&
                (ipfsJob.state['nosana/job-type'] === 'Github' ||
                  ipfsJob.state['nosana/job-type'] === 'github-flow')
              "
            >
              <a
                v-if="
                  ipfsJob.state['input/repo'] &&
                  ipfsJob.state['input/commit-sha']
                "
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
            <td v-else>Other</td>
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
          <li
            v-if="artifacts"
            :class="{ 'is-active': activeTab === 'artifacts' }"
          >
            <a @click.prevent="activeTab = 'artifacts'">Artifacts</a>
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
          <div
            v-if="job.state === 'RUNNING'"
            class="is-family-monospace has-background-black has-text-white box"
          >
            <div v-if="logs && logs.length > 0" style="counter-reset: line">
              <div v-for="step in logs" :key="step.id">
                <div
                  v-for="(log, ik) in step.logs.split('\n')"
                  :key="ik"
                  class="row-count"
                >
                  <span class="pre" v-html="log.slice(0, 10000)" />
                </div>
              </div>
            </div>
            <span v-else>Waiting for results...</span>
          </div>
          <div v-else-if="loading">Loading results..</div>
          <div v-else-if="!ipfsResult || !ipfsResult.results">No results</div>
          <div v-else-if="ipfsResult.results[0] === 'nos/secret'">
            Results are secret
          </div>
          <JobResult
            v-else-if="ipfsResult && job.state === 'COMPLETED'"
            :ipfs-result="ipfsResult"
            :ipfs-job="ipfsJob"
          />
        </div>
        <div
          v-show="activeTab === 'artifacts'"
          class="p-1 py-4 has-background-white-bis"
        >
          <div>
            <p class="block">
              <a
                v-if="ipfsGateway && artifacts"
                class="button"
                :href="`${ipfsGateway}${artifacts.trim()}`"
              >
                Download artifacts
              </a>
            </p>
            <p class="block">
              Download with CLI:<br />
              <code>npx nosana/cli download {{ artifacts }}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="loading">Loading inference..</div>
    <div v-else>Inference not found</div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Job } from '@nosana/sdk';
import VueJsonPretty from 'vue-json-pretty';
import { UseTimeAgo } from '@vueuse/components';
import axios from 'axios';
import AnsiUp from 'ansi_up';
import nodes from '@/static/nodes.json';
import testgridMarkets from '@/static/markets.json';

const sleep = (seconds: number): Promise<void> =>
  // eslint-disable-next-line promise/param-names
  new Promise((res) => setTimeout(res, seconds * 1e3));

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
const logs: Ref<any | null> = ref(null);
const { getIpfs } = useIpfs();
const artifacts = ref(null);
const ipfsGateway = ref(nosana.value ? nosana.value.ipfs.config.gateway : null);

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
    if (job.value.state === 'QUEUED' || job.value.state === 'RUNNING') {
      if (!isActive.value) resume();
    } else if (isActive.value) pause();

    try {
      ipfsJob.value = await getIpfs(job.value!.ipfsJob);
      if (
        job.value.state === 'RUNNING' &&
        ipfsJob.value &&
        typeof ipfsJob.value !== 'string' &&
        !logs.value
      ) {
        logs.value = [];
        await getStreamingLogs();
      }
      if (
        job.value!.ipfsResult &&
        job.value!.ipfsResult !==
          'QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51'
      ) {
        const resultResponse = await getIpfs(job.value!.ipfsResult);
        ipfsResult.value = resultResponse;
      }

      if (ipfsResult.value && typeof ipfsResult.value !== 'string') {
        const artifactId = ipfsJob.value.ops[ipfsJob.value.ops.length - 1].id;
        if (artifactId.startsWith('artifact-')) {
          if (ipfsResult.value!.results[artifactId]) {
            const steps = ipfsResult.value!.results[artifactId][1];
            if (Array.isArray(steps)) {
              const logs = steps[steps.length - 1].log;
              if (logs && logs[logs.length - 2]) {
                artifacts.value = logs[logs.length - 2][1].slice(-46);
              }
            }
          }
        }
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

        if (
          ipfsResult.value.results &&
          ipfsResult.value.results['nosana/error']
        ) {
          jobStatus.value = 'FAILED';
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

// TODO: implement this in the SDK
const getStreamingLogs = async () => {
  const jobInfo = job.value;
  const ops = ipfsJob.value.ops.filter((j: any) => !j.id.endsWith('-volume'));
  try {
    if (!ipfsJob.value.ops) return new Error('No job steps found');

    // @ts-ignore
    const node = nodes[job.value.node.toString()];
    const env = network.value as unknown as string;
    if (!node || !node[env] || !node[env].endpoint) {
      // skip streaming logs
      console.log('streaming logs: node or node endpoint not found');
      return;
    }

    const nodeUrl = node[env].endpoint.replace(
      '$MARKET',
      jobInfo?.market.toString().substring(0, 5),
    );

    const api = axios.create({
      baseURL: nodeUrl,
    });
    let response;
    let retries = 20;
    let jobFinished = false;
    let indexOfOp = 0;

    while (!jobFinished) {
      const stage = ops[indexOfOp];
      await sleep(1);

      try {
        response = await api.get(`/nosana/logs/${jobId.value}/${stage.id}`);
        const logsIndex = logs.value.findIndex((e: any) => e.id === stage.id);
        if (logsIndex > -1) {
          logs.value[logsIndex].logs = ansi.ansi_to_html(
            response.data.replace(String.fromCharCode(26), ''),
          );
        } else {
          logs.value.push({
            logs: ansi.ansi_to_html(
              response.data.replace(String.fromCharCode(26), ''),
            ),
            id: stage.id,
          });
        }

        if (response.status === 200) {
          indexOfOp++;
        } else {
          retries = 20;
        }
      } catch (err) {
        console.error(err);
        retries--;
        if (retries < 1) {
          const job = await nosana.value.jobs.get(jobId.value);

          if (job.state === 'COMPLETED' || job.state === 'STOPPED') {
            jobFinished = true;
            return;
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const { pause, resume, isActive } = useIntervalFn(getJob, 10000, {
  immediate: false,
});

getJob();
</script>
<style lang="scss" scoped>
.pre {
  white-space: pre-wrap;
}
</style>
