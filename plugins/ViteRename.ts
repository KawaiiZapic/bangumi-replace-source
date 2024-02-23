import { Plugin } from "vite";

export default (map?: Record<string, string>): Plugin => {
	return {
		name: "vite-rename-file",
		enforce: "post",
		generateBundle(options, bundle) {
			if (!map) return;
			Object.keys(map).forEach((key) => {
				const file = bundle[key];
				if (file) file.fileName = map[key];
			});
		},
	}
}