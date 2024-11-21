import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
    main: {
        build: {
            outDir: 'dist/main',
            rollupOptions: {
                input: {
                    index: path.join(__dirname, 'src/main/index.ts')
                },
                external: ['electron']
            }
        }
    },
    preload: {
        build: {
            outDir: 'dist/preload',
            rollupOptions: {
                input: {
                    index: path.join(__dirname, 'src/preload/index.ts')
                },
                external: ['electron']
            }
        }
    },
    renderer: {
        root: 'src/renderer',
        build: {
            outDir: 'dist/renderer',
            rollupOptions: {
                input: {
                    index: path.join(__dirname, 'src/renderer/index.html')
                }
            }
        },
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src/renderer')
            }
        }
    }
})