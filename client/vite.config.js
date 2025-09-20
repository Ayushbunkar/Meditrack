import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  // In dev, default to local backend; override with VITE_PROXY_TARGET if needed
  const target = !isProd
    ? env.VITE_PROXY_TARGET || 'http://localhost:5000'
    : undefined;

  return {
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
      host: true,
      port: 5173,
      proxy: target
        ? {
            '/api': {
              target,
              changeOrigin: true,
              secure: false,
              // keep path as-is (/api/... -> target/api/...)
              // no rewrite to avoid double slashes
              timeout: 20000,
              proxyTimeout: 20000,
            },
          }
        : undefined,
    },
    build: {
      sourcemap: false,
    },
  };
});
