require('dotenv').config();

const { createApp } = require('./app');
const { createDatabase } = require('./db/database');

const db = createDatabase();
const app = createApp({ db });
const port = Number(process.env.PORT || 3000);
const server = app.listen(port, () => {
  console.log(`BiasMap API listening on port ${port}`);
});

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; shutting down`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => {
    db.close();
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = { app, server };
