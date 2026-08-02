import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this repo from https://<user>.github.io/AlShatherOne/, so
// the app must be built for that subpath. Every reference to a file in public/
// goes through asset() in data.js, which reads import.meta.env.BASE_URL.
// Set VITE_BASE=/ when deploying somewhere that serves from the root.
// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE ?? '/AlShatherOne/',
  plugins: [react()],
})
