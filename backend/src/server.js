const app = require('./app');
const { port } = require('./config/env');
const logger = require('./utils/logger');

app.listen(port, () => {
  logger.info('server_started', { port, env: process.env.NODE_ENV });
});
