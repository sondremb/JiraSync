import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import checker from "vite-plugin-checker";
import netlify from "@netlify/vite-plugin";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
		viteTsconfigPaths(),
		checker({
			typescript: true,
			// vi har allerede typescript som en del av build-scriptet, så vi trenger ikke å kjøre det her
			enableBuild: false,
		}),
		netlify(),
	],
});
