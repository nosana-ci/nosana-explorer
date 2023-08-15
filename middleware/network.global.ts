export default defineNuxtRouteMiddleware((to, from) => {
  console.log(from.query, to.query);
  if (from.query.network && !to.query.network) {
    return navigateTo({
      path: to.path,
      query: { network: from.query.network },
    });
  }
});
