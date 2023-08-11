<template>
  <img v-if="img" style="height: 20px" :src="`/img/icons/type/${img}`" />
</template>

<script setup lang="ts">
const props = defineProps({
  ipfs: {
    type: Object,
    required: true,
  },
});
let type;
if (props.ipfs.state && props.ipfs.state['nosana/job-type']) {
  type = props.ipfs.state['nosana/job-type'];
} else if (props.ipfs.type) {
  type = props.ipfs.type;
}
const img = ref();
if (type) {
  if (type === 'Github' || type === 'github-flow') {
    img.value = 'github.svg';
  } else if (type === 'Gitlab' || type === 'gitlab-flow') {
    img.value = 'gitlab.svg';
  }
}
</script>
