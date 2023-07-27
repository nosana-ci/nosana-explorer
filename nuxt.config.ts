// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/styles/global.scss'],
  modules: ['@nuxtjs/google-fonts'],
  googleFonts: {
    families: {
      Lexend: [300, 400, 700],
    },
  },
});
