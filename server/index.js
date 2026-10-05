const app = require('./app');
const { closeDB, connectDB } = require('./config/db');

const port = Number(process.env.PORT) || 5101;

async function startServer() {
  await connectDB();

  const server = app.listen(port, () => {
    console.log(`Tutor Booking Server is running at http://localhost:${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await closeDB();
      process.exit(0);
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  return server;
}

// Start a listener locally. Vercel imports the exported Express app instead.
if (process.env.VERCEL !== '1') {
  startServer().catch((error) => {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  });
}

module.exports = app;
module.exports.startServer = startServer;
