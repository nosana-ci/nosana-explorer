<template>
  <div>
    <table class="table is-fullwidth is-striped">
      <tbody>
        <tr>
          <td><b>Total Job Queue</b></td>
          <td>
            <span v-if="markets">
              {{
                markets.reduce(
                  (a, b) => a + (b.queueType === 0 ? b.queue.length : 0),
                  0,
                )
              }}
              jobs
            </span>
            <span v-else-if="loadingMarkets">...</span>
            <span v-else>-</span>
          </td>
        </tr>
        <tr>
          <td><b>Total Node Queue</b></td>
          <td>
            <span v-if="markets">
              {{
                markets.reduce(
                  (a, b) => a + (b.queueType === 1 ? b.queue.length : 0),
                  0,
                )
              }}
              nodes
            </span>
            <span v-else-if="loadingMarkets">...</span>
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!loadingMarkets && !markets">Could not load markets</div>
  </div>
</template>

<script lang="ts" setup>
const { markets, loadingMarkets, getMarkets } = useMarkets();

// Fetch markets every 30 seconds
useIntervalFn(getMarkets, 30000);
</script>
