import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  //跨域问题可以在后端解决，也可以在前端解决，下面这段注释为前端解决，并且request.ts中的baseurl要改成前端端口
  // server:{
  //   proxy:{
  //     '/api':'http://localhost:8123'
  //   }
  // },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
