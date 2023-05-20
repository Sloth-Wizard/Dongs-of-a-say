import { defineConfig } from 'vite'

export default defineConfig({
    base: '/doas',
    build: {
        rollupOptions: {
            external: [new RegExp('/audio/*'), new RegExp('/video/*')]
        }
    }
})
