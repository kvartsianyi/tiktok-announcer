import express from 'express';
import morgan from 'morgan';

import * as cron from './cron.js';
import { API_URL, PORT } from './config.js';
import { bot } from './bot.js';
import { log } from './utils.js';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(await bot.createWebhook({ domain: API_URL }));

app.get('/', (req, res) => res.sendStatus(200));

app.listen(PORT, () => log(`Server started on port: ${PORT}`));