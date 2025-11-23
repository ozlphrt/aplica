import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/aplica-v2/', // Separate path for v2.0.0 deployment
  build: {
    outDir: 'dist-v2',
  },
})

