import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	plugins: [
		vue({
			script: {
				defineModel: true,
			},
		}),
	],

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 5678,
		strictPort: true,
		proxy: {
			"/api": {
				target: "http://localhost:3000/",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""), // 不可以省略rewrite
			},
		},
	},
	// 3. to make use of `TAURI_DEBUG` and other env variables
	// https://tauri.app/v1/api/config#buildconfig.beforedevcommand
	envPrefix: ["VITE_", "TAURI_", "SOCKET_"],
}))
