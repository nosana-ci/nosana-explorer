// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/styles/global.scss'],
  modules: ['@nuxtjs/google-fonts', '@vueuse/nuxt'],
  googleFonts: {
    preload: true,
    families: {
      Lexend: [300, 400, 700],
      'Space Mono': [500],
    },
  },
  app: {
    head: {
      bodyAttrs: {
        class: 'has-navbar-fixed-top',
      },
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          sourceMap: false,
          additionalData: '@import "@/assets/styles/variables.scss";',
        },
      },
    },
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..'],
      },
    },
  },
});
