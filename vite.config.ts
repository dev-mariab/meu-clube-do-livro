import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Plugin para resolver imports figma:asset/* usados no runtime do Figma Make
function figmaAssetPlugin() {
  return {
    name: 'figma-asset',
    resolveId(id: string) {
      if (id.startsWith('figma:')) {
        return '\0' + id
      }
    },
    load(id: string) {
      if (id.startsWith('\0figma:')) {
        return 'export default ""'
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetPlugin(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
