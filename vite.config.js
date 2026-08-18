import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(async ({ mode }) => {
  const plugins = [react()];
  try {
    const m = await import('./.vite-source-tags.js');
    if (m && m.sourceTags) {
      plugins.push(m.sourceTags());
    }
  } catch {}

  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  const processEnvDefines = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    plugins,
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
    build: {
      outDir: 'dist',
    },
  };
});
