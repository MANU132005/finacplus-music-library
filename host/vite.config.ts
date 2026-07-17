import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from the root of the host folder
  const env = loadEnv(mode, process.cwd(), '');
  const remoteUrl = env.VITE_REMOTE_URL || 'http://localhost:3001';

  return {
    plugins: [
      react(),
      federation({
        name: 'host',
        remotes: {
          music_library: `${remoteUrl}/assets/remoteEntry.js`,
        },
        shared: ['react', 'react-dom', '@tanstack/react-query', 'react-router-dom'],
      }),
    ],
    build: {
      modulePreload: false,
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
    },
    server: {
      port: 3000,
      strictPort: true,
    },
    preview: {
      port: 3000,
      strictPort: true,
    }
  };
});
