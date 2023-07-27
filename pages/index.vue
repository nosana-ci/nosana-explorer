<template>
  <div>
    <h1>Nosana Explorer</h1>
    Solana {{ nosana.solana.config.network }}
  </div>
</template>

<script setup lang="ts">
const nosana = useSDK();
</script>
