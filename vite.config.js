/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config = defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: path.resolve(dirname, 'src/index.js'),
      name: 'ReduxSounds',
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
      }
    }
  }
});

export default config;
