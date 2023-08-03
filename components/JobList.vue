<template>
  <div v-if="!filteredJobs.length">No jobs</div>
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
          v-for="(job, i) in filteredJobs"
          :key="job"
          :to="`/job/${job}`"
          custom
        >
          <template #default="{ navigate }">
            <tr class="is-clickable" @click="navigate">
              <td class="is-family-monospace">
                {{ job }}
              </td>
              <td v-if="loading" colspan="3">Loading job data..</td>
              <template v-else-if="jobData[i]">
                <td>
                  <UseTimeAgo
                    v-if="jobData[i].timeStart"
                    v-slot="{ timeAgo }"
                    :time="new Date(jobData[i].timeStart * 1000)"
                  >
                    {{ timeAgo }}
                  </UseTimeAgo>
                  <span v-else>-</span>
                </td>
                <td class="is-family-monospace">
                  <span v-if="jobData[i].timeEnd">
                    {{ fmtMSS(jobData[i].timeEnd - jobData[i].timeStart) }}
                  </span>
                  <span v-else-if="jobData[i].timeStart">
                    {{
                      fmtMSS(
                        Math.floor(timestamp / 1000) - jobData[i].timeStart,
                      )
                    }}
                  </span>
                  <span v-else> - </span>
                </td>
                <td>{{ jobData[i].state }}</td>
              </template>
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

const nosana = useSDK();
const timestamp = useTimestamp({ interval: 1000 });
const fmtMSS = (s: number) => {
  return (s - (s %= 60)) / 60 + (s > 9 ? 'm ' : 'm 0') + s + 's';
};
const props = defineProps({
  jobs: {
    type: Array,
    required: true,
  },
});

const loading = ref(false);
const jobData = ref([]);

const page: Ref<number> = ref(1);
const perPage: Ref<number> = ref(25);

const filteredJobs = computed(() => {
  if (!props.jobs || !props.jobs.length) return props.jobs;
  const paginatedJobs = props.jobs.slice(
    (page.value - 1) * perPage.value,
    page.value * perPage.value,
  );
  const filteredJobs = paginatedJobs.map((job) => job.pubkey);
  getJobData(filteredJobs);

  return filteredJobs;
});

const getJobData = async (jobs: Array<any>) => {
  loading.value = true;
  jobData.value = [];
  jobData.value = await nosana.solana.getMultipleJobs(jobs);
  loading.value = false;
};
</script>
