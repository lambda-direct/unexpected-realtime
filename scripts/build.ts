import fs from "node:fs";
import { build } from "tsup";

fs.rmSync("dist", { recursive: true, force: true });

await build({
	entry: [
		"src/index.ts",
		"src/pings/index.ts",
		"src/live-query/client/index.ts",
		"src/live-query/server/index.ts",
	],
	bundle: true,
	splitting: false,
	sourcemap: true,
	dts: true,
	format: ["cjs", "esm"],
	outExtension(ctx) {
		if (ctx.format === "cjs") {
			return {
				dts: ".d.cts",
				js: ".cjs",
			};
		}
		return {
			dts: ".d.ts",
			js: ".js",
		};
	},
});

fs.copyFileSync("package.json", "dist/package.json");
fs.copyFileSync("README.md", "dist/README.md");
