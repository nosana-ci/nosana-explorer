import svgLoader from 'vite-svg-loader';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

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
      title: 'Nosana Explorer',
      bodyAttrs: {
        class: 'has-navbar-fixed-top',
      },
      htmlAttrs: {
        class: 'dark',
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
      nodePolyfills({
        // To exclude specific polyfills, add them to this list.
        exclude: [
          'fs', // Excludes the polyfill for `fs` and `node:fs`.
        ],
        // Whether to polyfill specific globals.
        globals: {
          Buffer: true, // can also be 'build', 'dev', or false
          global: true,
          process: true,
        },
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
      }),
    ],
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..'],
      },
    },
    resolve: {
      alias: {
        stream: 'rollup-plugin-node-polyfills/polyfills/stream',
        events: 'rollup-plugin-node-polyfills/polyfills/events',
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
  },
});
