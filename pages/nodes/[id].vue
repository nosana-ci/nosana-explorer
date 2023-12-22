<template>
  <div class="box">
    <div v-if="loading">Loading node..</div>
    <div v-else>
      <div v-if="node">
        <h3 class="title is-5 address is-family-monospace mb-4">
          {{ nodeId }}
        </h3>
        <table class="table is-fullwidth is-striped">
          <tbody>
            <!-- <tr>
            Location:
            {{ node.flag ? node.flag : node.country }}
          </tr> -->

            <tr>
              <td>Authority</td>
              <td>
                <a
                  class="address is-family-monospace"
                  target="_blank"
                  :href="
                    'https://explorer.solana.com/address/' + node.authority
                  "
                  >{{ node.authority }}</a
                >
              </td>
            </tr>
            <tr>
              <td>Architecture type:</td>
              <td>{{ node.architecture }}</td>
            </tr>
            <tr>
              <td>CPU:</td>
              <td>{{ node.cpu }} cores</td>
            </tr>
            <!-- <tr>GPU: {{ node.gpu }} MB</tr> -->
            <tr>
              <td>Memory</td>
              <td>{{ node.memory }} GB</td>
            </tr>
            <!-- <tr>IOPS: {{ node.iops }} IOPS</tr> -->
            <tr>
              <td>Storage</td>
              <td>{{ node.storage }} GB</td>
            </tr>
            <tr>
              <td>Endpoint</td>
              <td>
                <a :href="node.endpoint" target="_blank">{{ node.endpoint }}</a>
              </td>
            </tr>
            <tr>
              <td>Version</td>
              <td>{{ node.version }}</td>
            </tr>
            <tr>
              <td>Audited</td>
              <td>
                <img
                  style="vertical-align: middle"
                  :src="`/img/icons/status/${
                    node.audited ? 'done' : 'done'
                  }.svg`"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <JobList title="Inferences by this node" :jobs="jobs"></JobList>
      </div>
      <div v-else>Node not found</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Job, Node } from '@nosana/sdk';
import countries from '@/static/countries.json';
const { params } = useRoute();

const { nosana, network } = useSDK();
const node: Ref<Node | null> = ref(null);
const nodeId: Ref<string> = ref(String(params.id));
const loading: Ref<boolean> = ref(false);
const jobs: Ref<Array<Job> | null> = ref(null);

watch(network, () => {
  node.value = null;
  jobs.value = null;
  getNode();
});

const getNode = async () => {
  try {
    loading.value = true;
    node.value = await nosana.value.nodes.get(nodeId.value, {
      authority: true,
    });
    const country = countries.find(
      (c: any) => c.number === node.value!.country!.toString(),
    );
    node.value.country = country!.name;
    node.value.flag = getFlagEmoji(country!.code);
    jobs.value = await nosana.value.jobs.all({ node: node.value.authority });
  } catch (e) {
    node.value = null;
  }
  loading.value = false;
};

const getFlagEmoji = (countryCode: any) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char: any) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

getNode();
</script>
<style lang="scss" scoped></style>
