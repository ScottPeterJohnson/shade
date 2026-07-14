import {defineConfig} from "vitest/config";
import {resolve} from "path";

export default defineConfig({
    resolve: {
        // Tests live in src/test/typescript and import the source under this alias.
        alias: {"@src": resolve(__dirname, "src")},
    },
    server: {
        // Tests live outside this project's root (in ../../test/typescript), so allow serving from src/.
        fs: {allow: [resolve(__dirname, "../..")]},
    },
    test: {
        environment: "jsdom",
        include: ["../../test/typescript/**/*.test.ts"],
        //Each test builds its own document, and the directive modules keep module level state
        restoreMocks: true,
    },
});
