import express from 'express';
import morgan from 'morgan';

import * as cron from './cron.js';
import { API_URL, PORT } from './config.js';
import { bot } from './bot.js';
import {
	log,
	logMemoryUsage,
	gracefulShutdown,
} from './utils.js';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(await bot.createWebhook({ domain: API_URL }));

app.get('/', (req, res) => res.sendStatus(200));

const server = app.listen(PORT, () => log(`Server started on port: ${PORT}`));

// Graceful shutdown of server
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, logMemoryUsage);
  process.on(signal, gracefulShutdown(server));
});

process.on('unhandledRejection', (reason) => {
	log('🚨 Uncaught Rejection Error:', reason);
	process.exit(0);
});

process.on('uncaughtException', error => {
	log('🚨 Uncaught Exception Error:', error);
	process.exit(0);
});