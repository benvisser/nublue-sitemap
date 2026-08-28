import react from '@vitejs/plugin-react'
import netlify from '@netlify/vite-plugin'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // netlify() gives `npm run dev` full local emulation of Netlify
  // primitives (Functions, Blobs, env vars from the linked site) without a
  // separate `netlify dev` process — see app/README.md "Local development".
  plugins: [react(), netlify()],
})
