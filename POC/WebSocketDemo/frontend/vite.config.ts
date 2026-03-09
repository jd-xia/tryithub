import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config: build tool and dev server. defineConfig gives typed config and IDE hints.
export default defineConfig({
  plugins: [react()],  // Enables JSX/TSX and Fast Refresh
  define: {
    global: 'globalThis',  // Some libs expect "global"; map it to globalThis for browser
  },
  optimizeDeps: {
    include: ['@stomp/stompjs', 'sockjs-client'],  // Pre-bundle these so dev server starts faster
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    port: 5173,
    // Proxy: requests from the frontend to /api or /ws are forwarded to the backend (avoids CORS).
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/ws': { target: 'http://localhost:8080', ws: true },  // ws: true for WebSocket upgrade
    },
  },
})
