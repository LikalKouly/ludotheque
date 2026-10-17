import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Tout le jeu tient dans un seul fichier HTML : facile à partager et à tester sur tablette.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
});
