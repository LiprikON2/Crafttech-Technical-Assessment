/// <reference types="vite/types/importMeta.d.ts" />
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    resolve: {
        alias: [
            { find: "~", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
            {
                find: "~/assets",
                replacement: fileURLToPath(new URL("./src/assets", import.meta.url)),
            },
            {
                find: "~/components",
                replacement: fileURLToPath(new URL("./src/components", import.meta.url)),
            },
            {
                find: "~/utils",
                replacement: fileURLToPath(new URL("./src/utils", import.meta.url)),
            },
            {
                find: "~/scenes",
                replacement: fileURLToPath(new URL("./src/scenes", import.meta.url)),
            },
            {
                find: "~/hooks",
                replacement: fileURLToPath(new URL("./src/hooks", import.meta.url)),
            },
            {
                find: "~/public",
                replacement: fileURLToPath(new URL("./public", import.meta.url)),
            },
        ],
    },
    plugins: [react()],
});
