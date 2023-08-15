let removedMainnet = false;
export default defineNuxtRouteMiddleware((to, from) => {
  if (from.query.network === 'devnet' && !to.query.network && !removedMainnet) {
    console.log('add devnet');
    return navigateTo({
      path: to.path,
      query: { network: from.query.network },
    });
  }
  removedMainnet = false;
  if (to.query.network === 'mainnet') {
    console.log('remove mainnet network');
    removedMainnet = true;
    return navigateTo({ path: to.path });
  }
});
