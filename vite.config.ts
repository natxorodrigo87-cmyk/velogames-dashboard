
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Esto mapea la variable de Netlify al código de la App
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
