import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Determinar la ruta base según el ambiente
  const basePath = mode === 'production' 
    ? '/deploy_github/sistema_admin/' 
    : '/deploy_github/sistema_admin_qa/'
  
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    
    // Base path para el deploy
    base: basePath,
    
    // Configuración de build
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development', // Solo sourcemaps en QA
      minify: mode === 'production'       // Solo minificar en producción
    }
  }
})