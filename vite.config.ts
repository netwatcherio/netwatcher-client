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
            hmr: {
                // Use the public host and port of your reverse proxy
                host: 'app.netwatcher.io',
                port: 443,
                protocol: 'wss'
            },
            strictPort: false
        }

})
