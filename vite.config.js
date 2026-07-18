import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base : chemin de publication sur GitHub Pages (github.io/ModeLmL/)
export default defineConfig({
  plugins: [react()],
  base: '/ModeLmL/',
})
