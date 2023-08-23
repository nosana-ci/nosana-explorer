<template>
  <div class="box">
    <div v-if="loading">Loading market..</div>
    <div v-else>
      <div v-if="market">
        <h3 class="subtitle mt-3">{{ marketId }}</h3>
        <ul class="mb-6">
          <li>Authority: {{ market.authority }}</li>
          <li>
            Job expiration: {{ parseInt(market.jobExpiration) / 60 }} seconds
          </li>
          <li>Job price: {{ parseInt(market.jobPrice) / 1e6 }}NOS</li>
          <li>Job timeout: {{ parseInt(market.jobTimeout) / 60 }} minutes</li>
          <li>Job type: {{ market.jobType }}</li>
          <li>Vault: {{ market.vault.toString() }}</li>
          <li>Vault bump: {{ market.vaultBump }}</li>
          <li>Node access key: {{ market.nodeAccessKey.toString() }}</li>
          <li>Minimum XNOS: {{ parseInt(market.nodeXnosMinimum) / 1e6 }}</li>
        </ul>
        <div class="py-5 queues columns">
          <div class="node-queue column is-half">
            <h2 class="title is-4">
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
import { useRoute } from 'vue-router';
import { Market } from '@nosana/sdk';

const { nosana } = useSDK();
const market: Ref<Market | null> = ref(null);
const marketId: Ref<string> = ref('');
const loading: Ref<boolean> = ref(false);
const jobs: Ref<Array<any> | null> = ref(null);

const getMarket = async () => {
  const { params } = useRoute();
  marketId.value = String(params.id);
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
