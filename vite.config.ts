import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://www.gstatic.com;
        connect-src 'self' https://accounts.google.com https://www.googleapis.com;
        frame-src https://accounts.google.com https://content.googleapis.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data:;
      `.replace(/\s+/g, ' '), // Minify the CSP header
    },
  },
  css: {
    postcss: './postcss.config.js', // Ensure PostCSS is configured
  },
});
