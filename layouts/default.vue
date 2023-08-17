<template>
  <div>
    <nav-bar />
    <section class="section pt-5 has-background-white-bis">
      <div class="container">
        <Search />
        <slot />
      </div>
    </section>
    <SiteFooter />
  </div>
</template>

<style lang="scss" scoped>
.section {
  // background-image: url(https://laurensverspeek.nl/_nuxt/img/grid.b919341.png);
}
</style>
