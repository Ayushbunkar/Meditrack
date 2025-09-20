import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Meditrek",
        short_name: "Meditrek",
        description: "Meditrek - Your meditation & wellness companion",
        theme_color: "#4CAF50",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/app.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/app.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'https://meditrack-3.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
