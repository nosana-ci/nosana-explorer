<template>
  <div
    class="tag is-outlined is-light"
    :class="{
      'is-success': status === 'COMPLETED',
      'is-info': status === 'RUNNING' || status === 'PENDING',
      'is-warning': status === 'QUEUED',
      'is-danger': status === 'FAILED' || status === 'YAML_ERROR',
    }"
  >
    <img class="mr-2" :src="`/img/icons/status/${getIcon(status)}.svg`" />

    <span>{{ status }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  status: {
    type: String,
    required: true,
  },
});
const getIcon = (status: string) => {
  let icon = 'stopped';
  if (status === 'QUEUED') {
    icon = 'queued';
  } else if (status === 'RUNNING') {
    icon = 'running';
  } else if (status === 'COMPLETED') {
    icon = 'done';
  } else if (status === 'FAILED' || status === 'YAML_ERROR') {
    icon = 'failed';
  }
  return icon;
};
</script>
