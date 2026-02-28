export const log = (message, ...args) =>
	console.log(message, ...args.filter(arg => typeof arg !== 'undefined'));
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export const getTgChatId = ctx => ctx.update?.message?.from?.id;

export const logMemoryUsage = () => {
  const memoryUsage = process.memoryUsage();

  log('📌 Memory usage:', {
    rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`, // Total memory used by the process
    heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`, // Total allocated heap memory
    heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`, // Memory used by heap
    external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`, // Memory used by external V8 objects
  });
};

export const gracefulShutdown = server => (signal, code) => {
  log(`Received (signal: ${signal}, code: ${code}), shutting down gracefully...`);

  server.close(() => {
    log('HTTP server successfully closed.');
    process.exit(0);
  });

  // Force exit if shutdown takes too long
  setTimeout(() => {
    log('Forcing shutdown...');
    process.exit(1);
  }, 5000).unref(); // Prevents setTimeout from keeping the process alive
};