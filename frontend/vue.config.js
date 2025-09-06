const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 您本地后端服务的地址
        changeOrigin: true,
        // 可选：如果您的后端路由本身不带/api，可以重写路径
        // pathRewrite: { '^/api': '' } 
      },
       '/uploads': { target: 'http://localhost:3000', changeOrigin: true } 
    }
  }
})