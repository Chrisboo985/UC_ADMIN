import path from 'path';
import { loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

import { visualizer } from 'rollup-plugin-visualizer';
import dayjs from 'dayjs';

import fs from 'fs';

// ----------------------------------------------------------------------

const PORT = 9527;

const timestamp = dayjs().format('YYYYMMDDHHmmss');

export default defineConfig(async ({ command, mode }) => {
  const root = process.cwd();
  const env = loadEnv(mode, root);

  // 获取 package.json 中的 name 字段
  const packageJson = JSON.parse(fs.readFileSync(path.resolve(root, 'package.json'), 'utf-8'));
  const packageName = packageJson.name;

  const isBuild = command === 'build';

  const outDir = `dist/[dist]${packageName}_${env.VITE_OUT_DIR}-${timestamp}` || `dist-${mode}`;

  return {
    plugins: [
      react(),
      checker({
        typescript: true,
        // eslint: {
        //   lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        //   dev: { logLevel: ['error'] },
        // },
        overlay: {
          position: 'tl',
          initialIsOpen: false,
        },
      }),
      // {
      //   name: 'exit-after-build',
      //   closeBundle() {
      //     // 在构建完成后强制退出进程
      //     process.exit(0);
      //   },
      // },
    ],
    resolve: {
      alias: [
        {
          find: /^~(.+)/,
          replacement: path.join(process.cwd(), 'node_modules/$1'),
        },
        {
          find: /^src(.+)/,
          replacement: path.join(process.cwd(), 'src/$1'),
        },
      ],
    },
    server: {
      port: PORT,
      host: true,
      proxy: {
        '/admin': {
          target: 'https://apiuc.tronify.net',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: { port: PORT, host: true },
    // build: {
    //   outDir: outDir, // 根据不同环境指定输出目录
    //   sourcemap: env.VITE_SOURCEMAP === 'true',
    //   rollupOptions: {
    //     plugins: env.VITE_USE_BUNDLE_ANALYZER === 'true' ? [visualizer()] : undefined,
    //   },
    // },
  };
});
