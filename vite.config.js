import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  VitePWA({
    registerType: "autoUpdate",
    includeAssets: ["favicon.svg", "vite.svg", "1024.png", "180.png", "120.png", "114.png", "60.png", "57.png", "40.png", "29.png", "80.png", "87.png", "58.png"],
    manifest: {
      name: "减肥记录助手",
      short_name: "减肥助手",
      description: "一个帮助你记录和跟踪体重变化的应用",
      theme_color: "#2196f3",
      icons: [
        {
          src: "1024.png",
          sizes: "1024x1024",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: "180.png",
          sizes: "180x180",
          type: "image/png",
          purpose: "apple touch icon"
        },
        {
          src: "120.png",
          sizes: "120x120",
          type: "image/png"
        },
        {
          src: "114.png",
          sizes: "114x114",
          type: "image/png"
        },
        {
          src: "87.png",
          sizes: "87x87",
          type: "image/png"
        },
        {
          src: "80.png",
          sizes: "80x80",
          type: "image/png"
        },
        {
          src: "60.png",
          sizes: "60x60",
          type: "image/png"
        },
        {
          src: "58.png",
          sizes: "58x58",
          type: "image/png"
        },
        {
          src: "57.png",
          sizes: "57x57",
          type: "image/png"
        },
        {
          src: "40.png",
          sizes: "40x40",
          type: "image/png"
        },
        {
          src: "29.png",
          sizes: "29x29",
          type: "image/png"
        }
      ]
    }
  })
  ],
   base: '/weight-tracker/',
});
