import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  server: {
    proxy: {
      // '/api/system-login-auth': {
      //   // target: 'http://10.4.14.229:9003',// 浩源本地环境
      //   target: 'http://192.168.55.34:9003', // 测试环境
      //   changeOrigin: true,
      //   rewrite: (path: string) => {
      //     return path.replace(/^\/api\/system-login-auth/, '')
      //   }
      // },
      '/api': {
        //target: 'http://10.4.14.229:9003',// 浩源本地环境
        //target: 'http://10.4.13.51:9003',// 黄浩本地环境
        target: 'https://devrf.tsapi.thundersoft.com', // 测试环境
        changeOrigin: true,
        rewrite: (path: string) => {
          return path.replace(/^\/api/, '')
        }
      },
    }
  },
  plugins: [react()]
});
