import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// In development the API is the local backend (:8080 unless VITE_DEV_API says
// otherwise); the app calls relative /api and /uploads paths, so no CORS and
// no VITE_API_URL are needed.
const api = process.env.VITE_DEV_API || 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    // Vite refuses requests whose Host is not localhost; allow VS Code dev tunnels
    // (Ports panel -> forward 5173 -> open the https address on a phone) and
    // anything listed in VITE_ALLOWED_HOSTS (comma-separated).
    allowedHosts: ['.devtunnels.ms', ...(process.env.VITE_ALLOWED_HOSTS || '').split(',').map((h) => h.trim()).filter(Boolean)],
    proxy: {
      '/api': api,
      '/uploads': api,
    },
  },
})
