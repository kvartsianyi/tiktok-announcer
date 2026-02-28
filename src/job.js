import { connectToDb, closeDbConnection, Subscription } from './database.js';
import { TiktokParser } from './parser.js';
import { sendTelegramMessage } from './telegram.js';
import { runWithDelay, withTimer } from './utils.js';
import { WEB_LIVE_URL } from './config.js';
import { logger } from './logger.js';

const requiredEnv = ['MONGO_URL', 'BOT_TOKEN', 'TG_CHAT_ID'];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

const job = async () => {
	try {
		logger.info('Job started...');

		await connectToDb(process.env.MONGO_URL);

		const subscriptions = await Subscription.find();
		const tiktokParser = new TiktokParser();

		const tasks = subscriptions.map(subscription => async () => {
			const { ttNickname, lastStreamAt: dbLastStreamAt } = subscription;

			try {
				const { isAlive, lastStreamAt: ttLastStreamAt } = await tiktokParser.getLiveRoomInfo(ttNickname);
				
				const isDifferentStream =
				ttLastStreamAt &&
				(!dbLastStreamAt || dbLastStreamAt < ttLastStreamAt);
				const sendNotification = isAlive && isDifferentStream;

				if (process.stdout.isTTY) {
					logger.info(`Checked ${ttNickname}: alive=${isAlive}`);
				}
				
				if (sendNotification) {
					subscription.lastStreamAt = ttLastStreamAt;
					await subscription.save();
					
					const message = `🔔 ${ttNickname} is live!\n${WEB_LIVE_URL.replace('{uniqueId}', ttNickname)}`;
					await sendTelegramMessage(process.env.TG_CHAT_ID, message);
				};

				return sendNotification;
			} catch (e) {
				logger.error(`Error for ${ttNickname}:`, e.stack);
				return false;
			}
		});

		const results = await runWithDelay(tasks, 500);

		const processedCount = results.filter(({ status }) => status === 'fulfilled').length;
		const notificationsCount = results.filter(({ status, value }) => (
			status === 'fulfilled' && Boolean(value))
		).length;

		logger.info('Accounts processed:', processedCount);
		logger.info('Job finished. Notifications sent:', notificationsCount);
	} catch (e) {
		logger.error('Fatal job error:', e.stack);

		process.exit(1);
	} finally {
		await closeDbConnection();
	}
};

await withTimer(job, 'Job')();
