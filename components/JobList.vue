<template>
  <div class="columns is-mobile is-vcentered">
    <div class="column">
      <h2 class="title is-4">
        {{ title ? title : 'Jobs' }}
        <span v-if="loadingJobs" class="is-size-7">refreshing</span>
      </h2>
    </div>
    <div v-if="jobs && jobs.length > perPage" class="column has-text-right">
      {{ (page - 1) * perPage + 1 }} -
      {{ Math.min(page * perPage, jobs.length) }} of {{ jobs.length }} jobs
    </div>
  </div>

  <div class="table-container">
    <table class="table is-fullwidth is-striped is-hoverable">
      <thead>
        <tr>
          <th>Address</th>
          <th>Started</th>
          <th>Duration</th>
          <th>Status</th>
          <th>Job Type</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!filteredJobs">
          <td colspan="5">Loading jobs..</td>
        </tr>
        <tr v-else-if="!filteredJobs.length">
          <td colspan="5">No jobs</td>
        </tr>
        <nuxt-link
          v-for="job in sortedJobs"
          v-else
          :key="job.pubkey"
          :to="`/job/${job.pubkey}`"
          custom
        >
          <template #default="{ navigate }">
            <tr
              class="is-clickable"
              :class="{ flash: job.new }"
              @click="navigate"
            >
              <td class="is-family-monospace">
                {{ job.pubkey }}
              </td>
              <template v-if="jobData[job.pubkey]">
                <td>
                  <UseTimeAgo
                    v-if="jobData[job.pubkey].timeStart"
                    v-slot="{ timeAgo }"
                    :time="new Date(jobData[job.pubkey].timeStart * 1000)"
                  >
                    {{ timeAgo }}
                  </UseTimeAgo>
                  <span v-else>-</span>
                </td>
                <td class="is-family-monospace">
                  <span v-if="jobData[job.pubkey].timeEnd">
                    {{
                      fmtMSS(
                        jobData[job.pubkey].timeEnd -
                          jobData[job.pubkey].timeStart,
                      )
                    }}
                  </span>
                  <span v-else-if="jobData[job.pubkey].timeStart">
                    {{
                      fmtMSS(
                        Math.floor(timestamp / 1000) -
                          jobData[job.pubkey].timeStart,
                      )
                    }}
                  </span>
                  <span v-else> - </span>
                </td>
                <td>
                  <JobStatus :status="jobData[job.pubkey].state"></JobStatus>
                </td>
                <td>
                  <li
                    v-if="
                      jobData[job.pubkey].ipfsData &&
                      jobData[job.pubkey].ipfsData.state &&
                      jobData[job.pubkey].ipfsData.state['nosana/job-type']
                    "
                    class="is-flex is-align-items-center is-justify-content-center"
                  >
                    <img
                      v-if="
                        jobData[job.pubkey].ipfsData.state[
                          'nosana/job-type'
                        ] === 'Gitlab' ||
                        jobData[job.pubkey].ipfsData.state[
                          'nosana/job-type'
                        ] === 'gitlab-flow'
                      "
                      width="30"
                      class="ml-1"
                      src="~assets/img/icons/gitlab.svg"
                    />
                    <img
                      v-else-if="
                        jobData[job.pubkey].ipfsData.state[
                          'nosana/job-type'
                        ] === 'github-flow' ||
                        jobData[job.pubkey].ipfsData.state[
                          'nosana/job-type'
                        ] === 'Github'
                      "
                      class="ml-1"
                      width="20"
                      src="~assets/img/icons/github.svg"
                    />
                  </li>
                </td>
              </template>
              <td v-else-if="loading" colspan="4">Loading job data..</td>
              <td v-else colspan="4">Could not load job data</td>
            </tr>
          </template>
        </nuxt-link>
      </tbody>
    </table>
  </div>
  <pagination
    v-if="jobs && jobs.length > perPage"
    v-model="page"
    class="pagination is-centered"
    :total-page="Math.ceil(jobs.length / perPage)"
    :max-page="6"
  >
  </pagination>
</template>

<script setup lang="ts">
import { UseTimeAgo } from '@vueuse/components';
import { Job } from '@nosana/sdk';

const { nosana } = useSDK();

const { loadingJobs } = useJobs();
const timestamp = useTimestamp({ interval: 1000 });
const fmtMSS = (s: number) => {
  return (s - (s %= 60)) / 60 + (s > 9 ? 'm ' : 'm 0') + s + 's';
};
const props = defineProps({
  jobs: {
    type: Array<{
      pubkey: any;
      timeStart: number;
      timeEnd: number;
      state: number;
      new?: number;
    }>,
    default: undefined,
  },
  title: {
    type: String,
    default: undefined,
  },
});

const loading = ref(false);
const jobData: Ref<{ [key: string]: Job }> = ref({});

const page: Ref<number> = ref(1);
const perPage: Ref<number> = ref(
  Math.max(25, props.jobs ? props.jobs.filter((j) => j.state === 0).length : 0),
);
let lastPage = page.value;
const visibility = useDocumentVisibility();

watch(visibility, (current, previous) => {
  if (current === 'visible' && previous === 'hidden') {
    if (filteredJobs.value) {
      for (let i = 0; i < filteredJobs.value.length; i++) {
        if (
          Object.prototype.hasOwnProperty.call(filteredJobs.value[i], 'new')
        ) {
          filteredJobs.value[i].new = 1;
        }
      }
    }
  }
});

const filteredJobs = computed(() => {
  if (!props.jobs || !props.jobs.length) return props.jobs;
  const paginatedJobs = props.jobs.slice(
    (page.value - 1) * perPage.value,
    page.value * perPage.value,
  );
  // check for new jobs when we are still on first page
  if (filteredJobs.value && page.value === 1 && lastPage === 1) {
    for (let i = 0; i < paginatedJobs.length; i++) {
      const oldJob = filteredJobs.value.find((job) => {
        return job.pubkey.toString() === paginatedJobs[i].pubkey.toString();
      });
      if (!oldJob || oldJob.new === 0) {
        paginatedJobs[i].new = visibility.value === 'visible' ? 1 : 0;
      }
    }
  }
  lastPage = page.value;
  return paginatedJobs;
});

const sortedJobs = computed(() => {
  if (!filteredJobs.value) return filteredJobs.value;
  return [...filteredJobs.value].sort((a, b) => {
    let at = a.timeStart;
    let bt = b.timeStart;
    const ajd = jobData.value[a.pubkey.toString()];
    const bjd = jobData.value[b.pubkey.toString()];
    if (ajd) at = ajd.timeStart;
    if (bjd) bt = bjd.timeStart;
    if (at === bt) {
      return a.pubkey.toString().localeCompare(b.pubkey.toString());
    }
    if (a.state === b.state) {
      if (at === 0) return -1;
      if (bt === 0) return 1;
      return bt - at;
    }
    return a.state - b.state;
  });
});

const getJobData = async (jobs: Array<any>) => {
  loading.value = true;
  const newJobData = await nosana.value.jobs.getMultiple(jobs);
  for (let i = 0; i < jobs.length; i++) {
    jobData.value[jobs[i]] = newJobData[i];
  }
  for (let i = 0; i < jobs.length; i++) {
    try {
      if (typeof jobData.value[jobs[i]].ipfsJob === 'string') {
        jobData.value[jobs[i]].ipfsData = await nosana.value.ipfs.retrieve(
          jobData.value[jobs[i]].ipfsJob,
        );
      }
    } catch (error) {
      console.error('cant get ipfs of job', error);
    }
  }
  loading.value = false;
};

watch(
  filteredJobs,
  (current) => {
    if (current) {
      const refreshJobs = current.filter((job) => {
        const data = jobData.value[job.pubkey];
        return !data || data.state === 'RUNNING' || data.state === 'QUEUED';
      });
      if (refreshJobs.length) {
        getJobData(refreshJobs.map((job) => job.pubkey));
      }
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
@keyframes flash {
  50% {
    background-color: $primary;
  }
}
.flash {
  animation: flash 2s ease-out;
  animation-iteration-count: 1;
}
</style>
