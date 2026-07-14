import {defineConfig} from "vite";
import {resolve} from "path";

// Builds the browser-side Shade bundle into src/main/resources/js.
// Run twice, once per mode:
//   vite build                    -> shade-bundle-min.js (minified, used in production)
//   vite build --mode development -> shade-bundle.js     (readable, used in development)
export default defineConfig(({mode}) => {
    const dev = mode === "development";
    return {
        build: {
            target: "es2015",
            outDir: resolve(__dirname, "../resources/js"),
            emptyOutDir: false,
            minify: !dev,
            //Inline (not a separate .map file) because the dev bundle is served/injected as a string,
            //so an external map wouldn't be reachable. Production stays map-free.
            sourcemap: dev ? "inline" : false,
            lib: {
                entry: resolve(__dirname, "src/shade.ts"),
                formats: ["iife"],
                name: "shade",
                fileName: () => dev ? "shade-bundle.js" : "shade-bundle-min.js",
            },
        },
    };
});
