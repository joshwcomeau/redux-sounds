/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import swc from '@rollup/plugin-swc';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config = defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: path.resolve(dirname, 'src/index.js'),
      name: 'ReduxSounds',
      formats: ['es'],
      // the proper extensions will be added
      fileName: 'redux-sounds'
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['howler/dist/howler.core.min.js'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          'howler/dist/howler.core.min.js': 'Howler'
        }
      },
      plugins: [swc({
        env: {
          targets: 'defaults and fully supports es6-module',
          loose: true,
          modules: false,
          bugfixes: true,
          shippedProposals: true,
          coreJs: '3.37',
          exclude: ['transform-typeof-symbol']
        }
      })]
    }
  }
});

export default config;
