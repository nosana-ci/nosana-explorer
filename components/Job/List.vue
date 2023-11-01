<template>
  <div class="columns is-mobile is-vcentered">
    <div class="column">
      <h2 class="title is-5">
        {{ title ? title : 'Jobs' }}
        <span v-if="loadingJobs" class="is-size-7">refreshing</span>
      </h2>
    </div>
    <div v-if="jobs && jobs.length > perPage" class="column has-text-right">
      {{ (page - 1) * perPage + 1 }} -
      {{ Math.min(page * perPage, jobs.length) }} of {{ jobs.length }} jobs
    </div>
  </div>

  <table
    class="table is-fullwidth is-striped is-hoverable mb-0"
    :class="{ 'is-small': small }"
  >
    <thead>
      <tr>
        <th></th>
        <th>Address</th>
        <th v-if="!small" class="is-hidden-touch">Node</th>
        <th>Started</th>
        <th class="is-hidden-mobile">Duration</th>
        <th v-if="!small" class="is-hidden-touch">Price</th>
        <th>Status</th>
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
        :to="`/jobs/${job.pubkey}`"
        custom
      >
        <template #default="{ navigate }">
          <tr
            class="is-clickable remove-greyscale-on-hover"
            :class="{ flash: job.new }"
            @click="navigate"
          >
            <td>
              <JobType
                v-if="jobData[job.pubkey] && jobData[job.pubkey].ipfsData"
                :ipfs="jobData[job.pubkey].ipfsData"
              />
              <span v-else-if="loading"><span class="loader"></span></span>
              <span v-else>-</span>
            </td>
            <td>
              <div class="is-family-monospace address">
                {{ job.pubkey }}
              </div>
            </td>
            <td v-if="!small" class="is-hidden-touch">
              <div class="is-family-monospace address">
                <span
                  v-if="
                    jobData[job.pubkey] &&
                    jobData[job.pubkey].state !== 'QUEUED'
                  "
                >
                  {{ jobData[job.pubkey].node }}
                </span>
                <span v-else-if="loading">...</span>
                <span v-else>-</span>
              </div>
            </td>
            <td>
              <UseTimeAgo
                v-if="jobData[job.pubkey] && jobData[job.pubkey].timeStart"
                v-slot="{ timeAgo }"
                :time="new Date(jobData[job.pubkey].timeStart * 1000)"
              >
                {{ timeAgo }}
              </UseTimeAgo>
              <UseTimeAgo
                v-else-if="job.timeStart"
                v-slot="{ timeAgo }"
                :time="new Date(job.timeStart * 1000)"
              >
                {{ timeAgo }}
              </UseTimeAgo>
              <span v-else>-</span>
            </td>
            <td class="is-family-monospace is-hidden-mobile">
              <span v-if="jobData[job.pubkey] && jobData[job.pubkey].timeEnd">
                {{
                  fmtMSS(
                    jobData[job.pubkey].timeEnd - jobData[job.pubkey].timeStart,
                  )
                }}
              </span>
              <span
                v-else-if="jobData[job.pubkey] && jobData[job.pubkey].timeStart"
              >
                {{
                  fmtMSS(
                    Math.floor(timestamp / 1000) -
                      jobData[job.pubkey].timeStart,
                  )
                }}
              </span>
              <span v-else-if="job.timeEnd">
                {{ fmtMSS(job.timeEnd - job.timeStart) }}
              </span>
              <span v-else-if="job.timeStart">
                {{ fmtMSS(Math.floor(timestamp / 1000) - job.timeStart) }}
              </span>
              <span v-else> - </span>
            </td>
            <td v-if="!small" class="is-hidden-touch">
              <span v-if="jobData[job.pubkey]">
                {{ jobData[job.pubkey].price / 1e6 }} NOS</span
              >
              <span v-else-if="loading">...</span>
              <span v-else>-</span>
            </td>
            <td>
              <JobStatus
                v-if="jobData[job.pubkey] && jobData[job.pubkey].state"
                :image-only="small"
                :status="jobData[job.pubkey].state"
              ></JobStatus>
              <JobStatus
                v-else-if="job.state === 2"
                :status="'COMPLETED'"
              ></JobStatus>
              <span v-else-if="loading">...</span>
              <span v-else>Could not load</span>
            </td>
          </tr>
        </template>
      </nuxt-link>
    </tbody>
  </table>
  <pagination
    v-if="jobs && jobs.length > perPage"
    v-model="page"
    class="pagination is-centered mt-4"
    :total-page="Math.ceil(jobs.length / perPage)"
    :max-page="6"
  >
  </pagination>
</template>

<script setup lang="ts">
import { UseTimeAgo } from '@vueuse/components';
import { Job } from '@nosana/sdk';

const { nosana } = useSDK();
const { getIpfs } = useIpfs();

const { loadingJobs } = useJobs();
const timestamp = useTimestamp({ interval: 1000 });
const fmtMSS = (s: number) => {
  return (s - (s %= 60)) / 60 + (s > 9 ? 'm:' : 'm:0') + s + 's';
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
  small: {
    type: Boolean,
    default: false,
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
    const ad = jobData.value[a.pubkey.toString()];
    const bd = jobData.value[b.pubkey.toString()];
    if (
      ad &&
      bd &&
      ['RUNNING', 'QUEUED'].includes(ad.state) &&
      ['RUNNING', 'QUEUED'].includes(bd.state)
    ) {
      if (ad.timeStart === 0) return -1;
      if (bd.timeStart === 0) return 1;
      return bd.timeStart - ad.timeStart;
    }
    return 0;
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
        jobData.value[jobs[i]].ipfsData = await getIpfs(
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
.table {
  white-space: nowrap;
  .address {
    max-width: 150px;
  }
  &.is-small {
    white-space: normal;
  }
}
@include touch {
  .table {
    white-space: normal;
  }
}
@include until-widescreen {
  .table {
    font-size: 12px;
    .address {
      max-width: 70px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
