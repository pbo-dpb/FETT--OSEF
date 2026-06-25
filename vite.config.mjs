import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    plugins: [
        vue({
            compilerOptions: {
                customElement: true,
            },
        }),
        tailwindcss(),
    ],
    build: {
        manifest: true,
        rollupOptions: {
            input: ["index.html", "./src/main.js"],
        },
        esbuild: {
            drop: ["console", "debugger"],
        },
    },
});
