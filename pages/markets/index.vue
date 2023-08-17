<template>
  <div>
    <h1 class="title is-5">Markets</h1>
    <MarketList :markets="markets"></MarketList>
    <div v-if="!loadingMarkets && !markets">Could not load markets</div>
  </div>
</template>
<script setup lang="ts">
const { network } = useSDK();
const { markets, getMarkets, loadingMarkets } = useMarkets();

const visibility = useDocumentVisibility();

watch(network, () => {
  markets.value = undefined;
  getMarkets();
});

watch(visibility, (current, previous) => {
  if (current === 'visible' && previous === 'hidden') {
    getMarkets();
  }
});

getMarkets();
</script>
