<template>
  <div class="box">
    <div v-if="loading && !market">Loading market..</div>
    <div v-else>
      <div v-if="market">
        <h3 class="subtitle mt-3">
          {{
            testgridMarkets[marketId]
              ? testgridMarkets[marketId].name
              : marketId
          }}
        </h3>
        <table class="table is-fullwidth is-striped">
          <tbody>
            <tr v-if="testgridMarkets[marketId]">
              <td>Market</td>
              <td>
                <a
                  target="_blank"
                  class="address is-family-monospace"
                  :href="'https://explorer.solana.com/address/' + marketId"
                  >{{ marketId }}</a
                >
              </td>
            </tr>
            <tr>
              <td>Authority</td>
              <td>
                <a
                  target="_blank"
                  class="address is-family-monospace"
                  :href="
                    'https://explorer.solana.com/address/' + market.authority
                  "
                  >{{ market.authority }}</a
                >
              </td>
            </tr>
            <tr>
              <td>Job expiration</td>
              <td>{{ market.jobExpiration / 3600 }} hours</td>
            </tr>
            <tr>
              <td>Price</td>
              <td>{{ market.jobPrice / 1e6 }} NOS/s</td>
            </tr>
            <tr>
              <td>Job timeout</td>
              <td>{{ market.jobTimeout / 60 }} minutes</td>
            </tr>
            <tr>
              <td>Node access key</td>
              <td>
                <a
                  target="_blank"
                  class="address is-family-monospace"
                  :href="
                    'https://explorer.solana.com/address/' +
                    market.nodeAccessKey.toString()
                  "
                  >{{ market.nodeAccessKey.toString() }}</a
                >
              </td>
            </tr>
            <tr>
              <td>Minimum Stake</td>
              <td>{{ market.nodeXnosMinimum / 1e6 }} xNOS</td>
            </tr>
          </tbody>
        </table>
        <div v-if="market.queueType === 1" class="py-5 queues columns">
          <div class="node-queue column is-half">
            <h2 class="title is-5">Node Queue</h2>
            <p v-if="market.queue.length > 0" class="mb-2">
              Total of: {{ market.queue.length }} node(s) in queue
            </p>
            <p v-else>There are no nodes in the queue at the moment</p>
          </div>
        </div>
        <JobList title="All Inferences in this market" :jobs="jobs"></JobList>
      </div>
      <div v-else>Market not found</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Market } from '@nosana/sdk';
import testgridMarkets from '@/static/markets.json';
const { getJobs } = useJobs();

const { params } = useRoute();
const { nosana, network } = useSDK();
const market: Ref<Market | null> = ref(null);
const marketId: Ref<string> = ref(String(params.id));
const loading: Ref<boolean> = ref(false);
const jobs: Ref<Array<any> | undefined> = ref(null);

watch(network, () => {
  market.value = null;
  jobs.value = undefined;
  getMarket();
});

const getMarket = async () => {
  try {
    loading.value = true;
    market.value = await nosana.value.jobs.getMarket(marketId.value);
    try {
      jobs.value = await getJobs({ market: marketId.value });
    } catch (error) {
      console.error('cant fetch jobs from market', error);
    }
  } catch (e) {
    market.value = null;
  }
  loading.value = false;
};

getMarket();

// Fetch market every 30 seconds
useIntervalFn(getMarket, 30000);
</script>
<style lang="scss" scoped></style>
