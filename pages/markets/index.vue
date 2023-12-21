<template>
  <div class="box">
    <h1 class="title is-5">Test Grid Markets</h1>
    <MarketList :markets="markets"></MarketList>
    <div v-if="!loadingMarkets && !markets">Could not load markets</div>
  </div>
</template>
<script setup lang="ts">
const { network } = useSDK();
const { markets, getMarkets, loadingMarkets } = useMarkets();
const visibility = useDocumentVisibility();

watch(visibility, (current, previous) => {
  if (current === 'visible' && previous === 'hidden') {
    getMarkets();
  }
});
if (!markets.value) {
  getMarkets();
}

watch(network, () => {
  getMarkets();
});

// Fetch markets every 30 seconds
useIntervalFn(getMarkets, 30000);
</script>
