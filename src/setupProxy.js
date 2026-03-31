const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api/avwx',
    createProxyMiddleware({
      target: 'https://aviationweather.gov',
      changeOrigin: true,
      pathRewrite: { '^/api/avwx': '/api/data' },
    })
  );
};
