const PROXY_CONFIG = [
  {
    devServer: {
      client: {
        webSocketTransport: 'sockjs',
        webSocketURL: 'http://localhost:8080/absproxy/4200/sockjs-node',
        logging: 'verbose',
      },
      proxy: {
        '/': 'http://localhost:8080/absproxy/4200',
      },
      static: {
        publicPath: '/absproxy/4200',
      },
      webSocketServer: 'sockjs',
    },
  }
]

module.exports = PROXY_CONFIG;