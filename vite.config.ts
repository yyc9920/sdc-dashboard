import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` is controlled via CLI flag during `vite build` in the GH Pages workflow:
//   vite build --base=/sdc-dashboard/
// so local dev keeps `/` and production builds get the repo-prefixed path.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: '127.0.0.1' },
  build: { target: 'es2020' },
});
