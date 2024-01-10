<template>
  <div>
    <div class="box">
      <h1 class="title is-5">TestGrid Earnings Per Node</h1>
      <div v-if="loading">Loading..</div>
      <button
        v-if="!earningsPerNode && !loading"
        class="button is-primary has-text-white"
        @click="getEarningsPerNode"
      >
        Generate
      </button>
      <div v-if="earningsPerNode" class="mb-3">
        {{ earningsPerNode.length }} nodes
      </div>
      <div v-if="earningsPerNode" class="mb-3 column-right">
        <button
          v-if="!loading"
          class="button is-primary has-text-white"
          @click="downloadCSV(earningsPerNode)"
        >
          Download CSV
        </button>
      </div>
      <div v-if="earningsPerNode" class="table-container">
        <table class="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>Node</th>
              <th># Jobs</th>
              <th>Earned</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4">Loading nodes..</td>
            </tr>
            <tr
              v-for="node of paginatedNodes"
              v-else
              :key="node.address"
              :to="`/address/${node}`"
            >
              <td class="py-3 is-clickable">{{ node.address }}</td>
              <td class="py-3">{{ node.jobs }}</td>
              <td class="py-3">{{ node.earned.toFixed(2) }} NOS</td>
            </tr>
          </tbody>
        </table>
        <pagination
          v-if="earningsPerNode && earningsPerNode.length > perPage"
          v-model="page"
          class="pagination is-centered mt-4"
          :total-page="Math.ceil(earningsPerNode.length / perPage)"
          :max-page="10"
        >
        </pagination>
      </div>
    </div>
    <!-- <div class="box">
      <h1 class="title is-5">Export all jobs</h1>
      <p>
        <button
          class="button is-primary has-text-white"
          @click="downloadAllJobs"
        >
          Export All Jobs
        </button>
      </p>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import testgridMarkets from '@/static/markets.json';
const dataUri: Ref<any> = ref(false);
const allJobs: Ref<any> = ref(false);
const { network } = useSDK();
const { getAllJobs } = useJobs();
const { markets, getMarkets } = useMarkets();
const loading: Ref<boolean> = ref(false);
const jsonJobs: Ref<any> = ref(null);
const earningsPerNode: Ref<any> = ref(null);
const page: Ref<number> = ref(1);
const perPage: Ref<number> = ref(15);

const importJobsJson = async () => {
  try {
    jsonJobs.value = await import(`@/static/${network.value}-jobs.json`);
  } catch (error) {
    console.error('import of json failed', error);
  }
};

await importJobsJson();
await getMarkets();
jsonJobs.value = jsonJobs.value.default;

watch(network, () => {
  getMarkets();
  importJobsJson();
});

const getEarningsPerNode = () => {
  loading.value = true;

  // weird for some reason a timeout is needed here
  setTimeout(() => {
    console.log('Loading earnings per node...');
    let nodeEarnings: any = [];

    if (jsonJobs.value && jsonJobs.value.length) {
      for (let i = 0; i < jsonJobs.value.length; i++) {
        const job = jsonJobs.value[i];
        const market = markets.value?.find(
          (m) => m.address.toString() === job.market.toString(),
        );
        if (market) {
          job.price = market.jobPrice;
          if (
            job.timeStart &&
            job.timeEnd &&
            testgridMarkets &&
            testgridMarkets[
              job.market.toString() as keyof typeof testgridMarkets
            ]
          ) {
            const earnedNos = (job.price / 1e6) * (job.timeEnd - job.timeStart);
            const nodeIndex = nodeEarnings.findIndex(
              (n: any) => n.address === job.node,
            );
            if (nodeIndex > -1) {
              nodeEarnings[nodeIndex].earned =
                nodeEarnings[nodeIndex].earned + earnedNos;
              nodeEarnings[nodeIndex].jobs = nodeEarnings[nodeIndex].jobs + 1;
            } else {
              nodeEarnings.push({
                address: job.node,
                earned: earnedNos,
                jobs: 1,
              });
            }
          }
        }
      }
      nodeEarnings = nodeEarnings.sort((a: any, b: any) => b.earned - a.earned);
      console.log('nodeEarnings', nodeEarnings);
      earningsPerNode.value = nodeEarnings;
      loading.value = false;
    }
  }, 100);
};

const paginatedNodes = computed(() => {
  if (!earningsPerNode.value || !earningsPerNode.value.length)
    return earningsPerNode.value;
  return earningsPerNode.value.slice(
    (page.value - 1) * perPage.value,
    page.value * perPage.value,
  );
});

const downloadCSV = (data: any) => {
  // Convert JSON data to CSV
  const csvData = jsonToCsv(data); // Add .items.data
  // Create a CSV file and allow the user to download it
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.csv';
  document.body.appendChild(a);
  a.click();
};

function jsonToCsv(jsonData: any) {
  let csv = '';
  // Get the headers
  const headers = Object.keys(jsonData[0]);
  csv += headers.join(',') + '\n';
  // Add the data
  jsonData.forEach(function (row: any) {
    const data = headers.map((header) => JSON.stringify(row[header])).join(','); // Add JSON.stringify statement
    csv += data + '\n';
  });
  return csv;
}

const downloadAllJobs = async () => {
  loading.value = true;
  try {
    allJobs.value = await getAllJobs();
    // '-' + Math.floor(Date.now() / 1000) +
    const jsonFile = network.value + '-jobs.json';
    const str = JSON.stringify(allJobs.value);

    // Save the file contents as a DataURI
    dataUri.value =
      'data:application/json;charset=utf-8,' + encodeURIComponent(str);

    const a = document.createElement('a');
    a.href = dataUri.value;
    a.download = jsonFile;
    document.body.appendChild(a);
    a.click();
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};
</script>
