import { defineConfig } from 'vite'

export default defineConfig({
    css: {
        modules: {
            scopeBehaviour: 'local',
        }
    },
    server: {
        proxy: {
            '/api': 'http://localhost:4000',
        }
    }
})