<template>
  <div v-if="!filteredJobs.length">No jobs</div>
  <div class="columns is-mobile is-vcentered">
    <div class="column">
      <h2 class="subtitle is-4">Jobs</h2>
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
        </tr>
      </thead>
      <tbody>
        <nuxt-link
          v-for="job in filteredJobs"
          :key="job.pubkey"
          :to="`/job/${job}`"
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
              </template>
              <td v-else-if="loading" colspan="3">Loading job data..</td>
              <td v-else colspan="3">Could not load job data</td>
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
const timestamp = useTimestamp({ interval: 1000 });
const fmtMSS = (s: number) => {
  return (s - (s %= 60)) / 60 + (s > 9 ? 'm ' : 'm 0') + s + 's';
};
const props = defineProps({
  jobs: {
    type: Array<{ pubkey: any; timeStart: any; new?: number }>,
    required: true,
  },
});

const loading = ref(false);
const jobData: Ref<{ [key: string]: Job }> = ref({});

const page: Ref<number> = ref(1);
const perPage: Ref<number> = ref(25);

const filteredJobs = computed(() => {
  if (!props.jobs || !props.jobs.length) return props.jobs;
  const paginatedJobs = props.jobs.slice(
    (page.value - 1) * perPage.value,
    page.value * perPage.value,
  );

  return paginatedJobs;
});

const getJobData = async (jobs: Array<any>) => {
  loading.value = true;
  const newJobData = await nosana.value.solana.getMultipleJobs(jobs);
  for (let i = 0; i < jobs.length; i++) {
    jobData.value[jobs[i]] = newJobData[i];
  }
  loading.value = false;
};

watch(
  filteredJobs,
  (current) => {
    const refreshJobs = current.filter((job) => {
      const data = jobData.value[job.pubkey];
      return !data || data.state === 'RUNNING' || data.state === 'QUEUED';
    });
    if (refreshJobs.length) {
      getJobData(refreshJobs.map((job) => job.pubkey));
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
