<template>
  <div>
    <table class="table is-fullwidth is-striped">
      <tbody>
        <tr>
          <td><b>Completed Jobs</b></td>
          <td>
            <span v-if="completedJobs">
              {{ completedJobs.length }}
            </span>
            <span v-else>-</span>
          </td>
        </tr>
        <tr>
          <td><b>Running Jobs</b></td>
          <td>
            <span v-if="runningJobs">
              {{ runningJobs.length }}
            </span>
            <span v-else>-</span>
          </td>
        </tr>
        <tr>
          <td><b>Queued Jobs</b></td>
          <td>
            <span v-if="queuedJobs">
              {{ queuedJobs.length }}
            </span>
            <span v-else>-</span>
          </td>
        </tr>
        <tr>
          <td><b>Online GPU Nodes</b></td>
          <td>
            <span v-if="nodeStats.onlineNodes">{{
              nodeStats.onlineNodes.length
            }}</span>
            <span v-else>-</span>
          </td>
        </tr>
        <tr>
          <td><b>Nodes in Queue</b></td>
          <td>
            <span v-if="nodeStats.nodesInMarkets">
              {{ nodeStats.nodesInMarkets.length }}
            </span>
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!loadingMarkets && !markets">Could not load nodes</div>
  </div>
</template>

<script lang="ts" setup>
// const { nodes, loadingNodes } = useNodes();
const { runs, jobs } = useJobs();
const { markets, loadingMarkets } = useMarkets();

const runningJobs = computed(() => {
  if (jobs.value) {
    return jobs.value.filter((j) => {
      // check if running
      return j.state === 1;
    });
  }
  return null;
});
const completedJobs = computed(() => {
  if (jobs.value) {
    return jobs.value.filter((j) => {
      // check if running
      return j.state === 2;
    });
  }
  return null;
});
const queuedJobs = computed(() => {
  if (jobs.value) {
    return jobs.value.filter((j) => {
      // check if running
      return j.state === 0;
    });
  }
  return null;
});

const nodeStats = computed(() => {
  // Get the combined GPUS in running jobs + queued
  const nodesInRuns = runs?.value?.map(function (item) {
    return item.account.node.toString();
  });

  const nodesInMarkets = markets?.value?.flatMap((market) => {
    return market.queueType === 1
      ? market.queue.map((data: any) => data.toString())
      : [];
  });

  const combined = nodesInMarkets?.concat(
    nodesInRuns?.filter((item) => !nodesInMarkets?.includes(item)),
  );

  const onlineNodes = [...new Set(combined)];
  return { onlineNodes, nodesInMarkets, nodesInRuns };
});
</script>
