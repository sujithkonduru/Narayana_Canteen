import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'motion': ['framer-motion'],
                    'charts': ['recharts'],
                    'store': ['zustand'],
                },
            },
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'https://CCTVlive.stackenzo.com',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
            '/getData': {
                target: 'https://CCTVlive.stackenzo.com',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
