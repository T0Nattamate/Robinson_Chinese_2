// vite.config.js (or .ts)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    // Use `true` to allow all hosts
    allowedHosts: true,

    // Bind to all interfaces so ngrok can tunnel
    host: true,
    port: 5173,
  },
});
