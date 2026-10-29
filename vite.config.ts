import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages හි subdirectory එකක (`/HiSacho/`) app එක ක්‍රියාත්මක වීමට base path එක සකස් කර ඇත
  base: '/HiSacho/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})
