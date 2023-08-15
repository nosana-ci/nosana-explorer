<template>
  <div>
    <NuxtLink to="/" class="text-sm">&lt; Back</NuxtLink>
    <div v-if="loading">Loading project..</div>
    <div v-else>
      <div v-if="address">
        <h3 class="subtitle mt-3 mb-2">{{ address }}</h3>
        <p class="mb-6 is-2">NOS Balance: {{ balance.uiAmount }}</p>
        <JobList
          v-if="jobs.length > 0"
          title="Jobs for this project"
          :jobs="jobs"
        ></JobList>
        <span v-else-if="!loading"> No jobs found for this address. </span>
      </div>
      <div v-else>Project not found</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Job } from '@nosana/sdk';

const { nosana } = useSDK();
const address: Ref<string> = ref('');
const balance: Ref<any> = ref('');
const loading: Ref<boolean> = ref(false);
const jobs: Ref<Array<Job> | null> = ref(null);

const getAddress = async () => {
  const { params } = useRoute();
  address.value = String(params.id);
  try {
    loading.value = true;
    balance.value = await nosana.value.solana.getNosBalance(address.value);
    jobs.value = await nosana.value.jobs.all({ project: address.value });
  } catch (e) {
    address.value = null;
  }
  loading.value = false;
};

getAddress();
</script>
<style lang="scss" scoped></style>
