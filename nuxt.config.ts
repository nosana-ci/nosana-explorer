import svgLoader from 'vite-svg-loader';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  dir: {
    public: 'static',
  },
  css: ['~/assets/styles/global.scss', 'vue-json-pretty/lib/styles.css'],
  modules: ['@nuxtjs/google-fonts', '@vueuse/nuxt'],
  googleFonts: {
    preload: true,
    families: {
      Lexend: [300, 400, 700],
      'Space Mono': [500],
    },
  },
  build: {
    transpile: ['vue-countup-v3'],
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
    plugins: [
      svgLoader({
        defaultImport: 'url',
      }),
    ],
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..'],
      },
    },
  },
});
