// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/styles/global.scss'],
  modules: ['@nuxtjs/google-fonts'],
  googleFonts: {
    preload: true,
    families: {
      Lexend: [300, 400, 700],
    },
  },
  vite: {
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..'],
      },
    },
  },
});
