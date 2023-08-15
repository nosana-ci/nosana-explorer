<template>
  <div>
    <NuxtLink to="/" class="text-sm">&lt; Back</NuxtLink>
    <div v-if="loading">Loading..</div>
    <div v-else>
      <div v-if="address">
        <h3 class="subtitle mt-3 mb-2">{{ address }}</h3>
        <p v-if="balance && balance.uiAmount" class="mb-6 is-2">
          NOS Balance: {{ balance.uiAmount }}
        </p>
        <hr />
        <JobList
          v-if="jobs && jobs.length > 0"
          title="Jobs for this project"
          :jobs="jobs"
        ></JobList>
        <span v-else-if="!loading"> No jobs found for this address. </span>
      </div>
      <div v-else>Address not found</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Job } from '@nosana/sdk';
import { PublicKey } from '@solana/web3.js';

const { nosana } = useSDK();
const address: Ref<string> = ref('');
const balance: Ref<any> = ref('');
const loading: Ref<boolean> = ref(false);
const jobs: Ref<Array<Job> | null> = ref(null);

const getAddress = async () => {
  const { params } = useRoute();
  loading.value = true;
  try {
    const pk = new PublicKey(String(params.id));
    address.value = pk.toString();

    try {
      jobs.value = await nosana.value.jobs.all({ project: address.value });
    } catch (e) {
      console.log('cant get jobs of project', e);
    }

    try {
      balance.value = await nosana.value.solana.getNosBalance(address.value);
    } catch (e) {
      console.error('cant get balance', e);
    }
  } catch (error) {
    console.error('not a valid address', error);
    address.value = null;
  }
  loading.value = false;
};

getAddress();
</script>
<style lang="scss" scoped></style>
