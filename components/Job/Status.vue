<template>
  <div
    v-if="!imageOnly"
    class="tag is-outlined is-light"
    :class="{
      'is-success': status === 'COMPLETED',
      'is-info': status === 'RUNNING' || status === 'PENDING',
      'is-warning': status === 'QUEUED',
      'is-danger': status === 'FAILED' || status === 'YAML_ERROR',
    }"
  >
    <img class="mr-2" :src="`/img/icons/status/${getIcon(status)}.svg`" />

    <span v-if="!imageOnly">{{ status }}</span>
  </div>
  <img v-else :src="`/img/icons/status/${getIcon(status)}.svg`" />
</template>

<script setup lang="ts">
defineProps({
  status: {
    type: String,
    required: true,
  },
  imageOnly: {
    type: Boolean,
    default: false,
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

<style lang="scss" scoped>
.tag {
  min-width: max-content;
}

@include until-widescreen {
  .tag {
    background: none !important;
    border: none !important;
    padding: 0 !important;
    img {
      margin: 0 !important;
    }
    span {
      display: none;
    }
  }
}
</style>
