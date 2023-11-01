<template>
  <div>
    <table class="table is-fullwidth is-striped">
      <tbody>
        <tr>
          <td><b>Registered</b></td>
          <td>
            <span v-if="nodes">{{ nodes.length }} nodes</span>
            <span v-else-if="loadingNodes">...</span>
            <span v-else>-</span>
          </td>
        </tr>
        <tr>
          <td><b>Online</b></td>
          <td>
            <span v-if="nodes">{{ nodes.length }} nodes</span>
            <span v-else-if="loadingNodes">...</span>
            <span v-else>-</span>
          </td>
        </tr>
        <tr>
          <td><b>Total CPU</b></td>
          <td>
            <span v-if="nodes">
              {{ nodes.reduce((a, b) => a + b.cpu, 0) }} cores
            </span>
            <span v-else-if="loadingNodes">...</span>
            <span v-else>-</span>
          </td>
        </tr>
        <tr>
          <td><b>Total GPUs</b></td>
          <td>
            <span v-if="nodes">
              {{ Math.ceil(nodes.length * 0.6) }}
            </span>
            <span v-else-if="loadingNodes">...</span>
            <span v-else>-</span>
          </td>
        </tr>
        <tr>
          <td><b>Total Memory</b></td>
          <td>
            <span v-if="nodes">
              {{ nodes.reduce((a, b) => a + b.memory, 0) }} GB
            </span>
            <span v-else-if="loadingNodes">...</span>
            <span v-else>-</span>
          </td>
        </tr>
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
        <tr>
          <td><b>Total Storage</b></td>
          <td>
            <span v-if="nodes">
              {{ nodes.reduce((a, b) => a + b.storage, 0) }} GB
            </span>
            <span v-else-if="loadingNodes">...</span>
            <span v-else>-</span>
          </td>
        </tr>
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
    <div v-if="!loadingNodes && !nodes">Could not load nodes</div>
  </div>
</template>

<script lang="ts" setup>
const { nodes, loadingNodes, getNodes } = useNodes();

// Fetch nodes every 60 seconds
useIntervalFn(getNodes, 60000);
</script>
