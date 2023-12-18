<template>
  <div class="box">
    <div v-if="loading">Loading..</div>
    <div v-else>
      <div v-if="address">
        <div
          class="is-flex is-align-items-center is-justify-content-space-between mb-4"
        >
          <h3 class="title is-5 address is-family-monospace my-0">
            {{ address }}
          </h3>
        </div>

        <table class="table is-fullwidth is-striped mt-5 mb-6">
          <tbody>
            <tr>
              <td>NOS Balance</td>
              <td>
                <span v-if="balance">{{ balance.uiAmount }}</span> NOS
              </td>
            </tr>
            <tr v-if="jobs">
              <td>Jobs ran</td>
              <td>
                <span>{{ jobs.length }}</span>
              </td>
            </tr>
            <!-- TODO: First need to include price in the jobs.all() in SDK-->
            <!-- <tr v-if="jobs">
              <td>Total NOS earned</td>
              <td>
                <span>{{
                  jobs.reduce((a, b) => {
                    return a + b.price && b.timeEnd && b.timeStart
                      ? (b.price / 1e6) * (b.timeEnd - b.timeStart)
                      : 0;
                  }, 0)
                }}</span>
              </td>
            </tr> -->
          </tbody>
        </table>

        <JobList
          v-if="jobs && jobs.length > 0"
          title="Jobs by this node"
          :jobs="jobs"
        ></JobList>
        <span v-else-if="!loading"> No jobs found for this address. </span>
      </div>
      <div v-else>Address not found</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PublicKey, Connection } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import testgridMarkets from '@/static/markets.json';

const { params } = useRoute();
const { nosana, network } = useSDK();
const address: Ref<string | null> = ref(null);
const balance: Ref<any | null> = ref(null);
const nodeNfts: Ref<Array<any>> = ref([]);
const loading: Ref<boolean> = ref(false);
const jobs: Ref<Array<any> | null> = ref(null);

// create connection for Metaplex
// TODO move this to SDK or composable(?)
const web3 = new Connection(
  network.value === 'devnet'
    ? 'https://rpc-devnet.hellomoon.io/853e30f5-383d-4cc6-a5ee-b5fb4c7a7178'
    : 'https://rpc.hellomoon.io/853e30f5-383d-4cc6-a5ee-b5fb4c7a7178',
);
const metaplex = new Metaplex(web3);

watch(network, () => {
  address.value = null;
  balance.value = null;
  jobs.value = null;
  getAddress();
});

const getAddress = async () => {
  loading.value = true;
  try {
    const pk = new PublicKey(String(params.id));
    address.value = pk.toString();

    try {
      jobs.value = await nosana.value.jobs.all({ node: address.value });
      console.log('jobs', jobs.value);
    } catch (e) {
      console.log('cant get jobs of project', e);
    }

    try {
      balance.value = await nosana.value.solana.getNosBalance(address.value);
    } catch (e) {
      console.error('cant get balance', e);
    }
    console.log('address:', address.value);

    try {
      const nfts = await metaplex
        .nfts()
        .findAllByOwner({ owner: new PublicKey(address.value) });

      for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i];
        for (const market in testgridMarkets) {
          const marketObject =
            testgridMarkets[market as keyof typeof testgridMarkets];
          if (
            nft &&
            nft.collection &&
            nft.collection.verified &&
            nft.collection.address.toString() === marketObject.collection
          ) {
            nodeNfts.value.push(nft);
          }
        }
      }
    } catch (e) {
      console.error('cant get nft', e);
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
