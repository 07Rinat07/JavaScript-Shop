import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react({
        include: /\.(js|jsx|ts|tsx)$/
    })],
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.jsx?$/,
        exclude: []
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx'
            }
        }
    },
    server: {
        port: 3000
    },
    build: {
        outDir: 'build',
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-state': ['mobx', 'mobx-react-lite'],
                    'vendor-ui': ['bootstrap', 'react-bootstrap'],
                    'vendor-http': ['axios', 'jwt-decode'],
                }
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.js',
        css: true
    }
})
