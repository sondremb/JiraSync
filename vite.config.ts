import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import checker from "vite-plugin-checker";
import netlify from "@netlify/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
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
