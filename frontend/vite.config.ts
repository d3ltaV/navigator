import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            // Flask serves /api/* (data) and /static/* (images/pig, etc.).
            '/api': { target: 'http://127.0.0.1:3000', changeOrigin: true },
            '/static': { target: 'http://127.0.0.1:3000', changeOrigin: true },
        },
    },
})
