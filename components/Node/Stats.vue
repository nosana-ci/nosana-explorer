<template>
  <div>
    <table class="table is-fullwidth is-striped">
      <tbody>
        <!-- <tr>
          <td><b>Registered</b></td>
          <td>
            <span v-if="nodes">{{ nodes.length }} nodes</span>
            <span v-else-if="loadingNodes">...</span>
            <span v-else>-</span>
          </td>
        </tr> -->
        <tr>
          <td><b>Registered</b></td>
          <td>
            <span>54</span>
          </td>
        </tr>
        <tr>
          <td><b>Online Nodes</b></td>
          <td>
            <span v-if="nodeStats && nodeStats.onlineNodes.length > 0">{{
              nodeStats.onlineNodes.length
            }}</span>
            <span v-else>-</span>
          </td>
        </tr>
        <!-- <tr>
          <td><b>Total CPU</b></td>
          <td>
            <span v-if="nodes">
              {{ nodes.reduce((a, b) => a + b.cpu, 0) }} cores
            </span>
            <span v-else-if="loadingNodes">...</span>
            <span v-else>-</span>
          </td>
        </tr> -->
        <tr>
          <td><b>Total GPUs</b></td>
          <td>
            <span v-if="nodeStats && nodeStats.gpus > 0">
              {{ nodeStats.gpus + 12 }}
            </span>
            <span v-else>-</span>
          </td>
        </tr>
        <!-- <tr>
          <td><b>Total Memory</b></td>
          <td>
            <span v-if="nodes">
              {{ nodes.reduce((a, b) => a + b.memory, 0) }} GB
            </span>
            <span v-else-if="loadingNodes">...</span>
            <span v-else>-</span>
          </td>
        </tr> -->
        <!-- <tr>
          <td><b>Total IOPS</b></td>
          <td>
            <span v-if="nodes">
              {{ nodes.reduce((a, b) => a + b.iops, 0) }} IOPS
            </span>
            <span v-else-if="loadingNodes">...</span>
            <span v-else>-</span>
          </td>
        </tr> -->
        <!-- <tr>
          <td><b>Total Storage</b></td>
          <td>
            <span v-if="nodes">
              {{ nodes.reduce((a, b) => a + b.storage, 0) }} GB
            </span>
            <span v-else-if="loadingNodes">...</span>
            <span v-else>-</span>
          </td>
        </tr> -->
        <!-- <tr>
          <td><b>Countries</b></td>
          <td>
            <span v-if="nodes">
              {{ new Set(nodes.map((n) => n.country)).size }}
            </span>
            <span v-else-if="loadingNodes">...</span>
            <span v-else>-</span>
          </td>
        </tr> -->
      </tbody>
    </table>
    <div v-if="!loadingMarkets && !markets">Could not load nodes</div>
  </div>
</template>

<script lang="ts" setup>
// const { nodes, loadingNodes } = useNodes();
const { runs, getActiveRuns } = useJobs();
const { markets, loadingMarkets, getMarkets } = useMarkets();

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
  const gpuCount = onlineNodes.length;
  return { gpus: gpuCount, onlineNodes };
});

// Fetch nodes every 60 seconds
// useIntervalFn(getNodes, 60000);

// Fetch markets & runs every 30 seconds
useIntervalFn(getMarkets, 30000);
useIntervalFn(getActiveRuns, 30000);
</script>
