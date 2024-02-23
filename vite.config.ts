import { defineConfig, UserConfig } from "vite";
import ViteRenamePlugin from "./plugins/ViteRename";
import zip from "./plugins/ViteZipPack";

export default defineConfig((env) => {
	if (env.mode == "content") {
		return {
			publicDir: false,
			build: {
				emptyOutDir: true,
				minify: false,
				rollupOptions: {
					input: {
						"content-script": "src/content/index.ts"
					},
					output: {
						entryFileNames: "[name].js",
						format: "iife"
					}
				}
			}
		} as UserConfig;
	} else if (env.mode == "popup") {
		return {
			plugins: [
				ViteRenamePlugin({
					"src/popup/index.html": "popup.html"
				}),
				zip({
					outDir: "dist"
				})
			],
			build: {
				emptyOutDir: false,
				minify: false,
				rollupOptions: {
					input: {
						popup: "src/popup/index.html",
						host: "src/content/host.ts"
					},
					output: {
						assetFileNames: "assets/[name].[ext]",
						entryFileNames: "assets/[name].js"
					}
				}
			}
		} as UserConfig;
	}
	throw Error("Unknown mode: " + env.mode);
});
