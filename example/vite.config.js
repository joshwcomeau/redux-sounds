import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    command === 'build' &&
      legacy({
        targets: '>0.3%, defaults'
      })
  ].filter(Boolean)
}));
