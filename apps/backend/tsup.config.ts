import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/app.ts', 'src/handler.ts'],
  format: ['cjs'],
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  external: ['@prisma/client'],
  noExternal: [/.*/],
}); 