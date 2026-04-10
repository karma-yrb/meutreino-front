import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import process from 'node:process'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const basePath = process.env.VITE_BASE_PATH || "/"

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    exclude: ["e2e/**"],
  },
})
