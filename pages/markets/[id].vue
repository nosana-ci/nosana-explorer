<template>
  <div class="box">
    <div v-if="loading">Loading market..</div>
    <div v-else>
      <div v-if="market">
        <h3 class="subtitle mt-3">{{ marketId }}</h3>
        <table class="table is-fullwidth is-striped">
          <tbody>
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
              <td>{{ market.jobExpiration / 60 }} seconds</td>
            </tr>
            <tr>
              <td>NOS per second</td>
              <td>{{ market.jobPrice / 1e6 }}NOS</td>
            </tr>
            <tr>
              <td>Job timeout</td>
              <td>{{ market.jobTimeout / 60 }} minutes</td>
            </tr>
            <tr>
              <td>Job type</td>
              <td>{{ market.jobType }}</td>
            </tr>
            <tr>
              <td>Vault</td>
              <td>
                <a
                  target="_blank"
                  class="address is-family-monospace"
                  :href="
                    'https://explorer.solana.com/address/' +
                    market.vault.toString()
                  "
                  >{{ market.vault.toString() }}</a
                >
              </td>
            </tr>
            <tr>
              <td>Vault bump</td>
              <td>{{ market.vaultBump }}</td>
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
              <td>Minimum XNOS</td>
              <td>{{ market.nodeXnosMinimum / 1e6 }}</td>
            </tr>
          </tbody>
        </table>
        <div class="py-5 queues columns">
          <div class="node-queue column is-half">
            <h2 class="title is-5">
              <span v-if="market.queueType === 0"> Job </span>
              <span v-else-if="market.queueType === 1"> Node </span>
              Queue
            </h2>
            <p v-if="market.queue.length > 0" class="mb-2">
              Total of: {{ market.queue.length }}
              <span v-if="market.queueType === 0"> job(s) </span>
              <span v-else-if="market.queueType === 1"> node(s) </span> in queue
            </p>
            <div
              v-if="market.queue.length > 0"
              class="table-container mb-0 has-radius-medium"
            >
              <table class="table is-striped is-fullwidth is-hoverable mb-3">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in market.queue" :key="index">
                    <td class="is-size-6">
                      {{ index + 1 }}
                    </td>
                    <td>
                      <nuxt-link
                        v-if="market.queueType === 0"
                        class="is-family-monospace address"
                        :href="'/jobs/' + item"
                      >
                        {{ item }}
                      </nuxt-link>
                      <nuxt-link
                        v-else
                        class="is-family-monospace address"
                        :href="'/nodes/' + item"
                      >
                        {{ item }}
                      </nuxt-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else>There are no jobs or nodes in the queue at the moment</p>
          </div>
        </div>
        <JobList title="All Jobs in this market" :jobs="jobs"></JobList>
      </div>
      <div v-else>Market not found</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Market } from '@nosana/sdk';

const { params } = useRoute();
const { nosana, network } = useSDK();
const market: Ref<Market | null> = ref(null);
const marketId: Ref<string> = ref(String(params.id));
const loading: Ref<boolean> = ref(false);
const jobs: Ref<Array<any> | null> = ref(null);

watch(network, () => {
  market.value = null;
  jobs.value = null;
  getMarket();
});

const getMarket = async () => {
  try {
    loading.value = true;
    market.value = await nosana.value.jobs.getMarket(marketId.value);
    try {
      jobs.value = await nosana.value.jobs.all({ market: marketId.value });
    } catch (error) {
      console.error('cant fetch jobs from market', error);
    }
  } catch (e) {
    market.value = null;
  }
  loading.value = false;
};

getMarket();
</script>
<style lang="scss" scoped></style>
