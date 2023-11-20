import {fileURLToPath, URL} from 'url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
        server: {
            proxy: {
                // Catch-all proxy configuration
                '^/.*': {
                    target: 'https://app.netwatcher.io', // Replace with your proxy server URL and port
                    changeOrigin: true,
                    ws: true, // Enables WebSocket support
                    // You can add more specific configurations here if necessary
                }
            }
        }

})
