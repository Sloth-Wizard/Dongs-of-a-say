import { defineConfig } from 'vite'

export default defineConfig({
    base: '/zzdhdhdhddfskykh',
    build: {
        rollupOptions: {
            external: [new RegExp('/audio/*'), new RegExp('/video/*')]
        }
    }
})
