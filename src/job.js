import { connectToDb, closeDbConnection, Subscription } from './database.js';
import { TiktokParser } from './parser.js';
import { captureScreenshot } from './ffmpeg.js';
import { sendMessage, sendPhoto } from './telegram.js';
import { runWithDelay, withTimer } from './utils.js';
import { WEB_LIVE_URL } from './config.js';
import { logger } from './logger.js';

const requiredEnv = ['MONGO_URL', 'BOT_TOKEN', 'TG_CHAT_ID'];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

const shouldNotify = (isAlive, ttLastStreamAt, dbLastStreamAt) => {
  const isDifferentStream =
    ttLastStreamAt &&
    (!dbLastStreamAt || dbLastStreamAt < ttLastStreamAt);

  return isAlive && isDifferentStream;
};

const getThumbnail = async (streamUrl) => {
  try {
    return await captureScreenshot(streamUrl);
  } catch (e) {
    logger.error(`[notificationsJob] Screenshot error:`, e);
    return null;
  }
};

const sendNotification = async (chatId, message, image) => {
  if (image) {
    return sendPhoto(chatId, message, image);
  }

  return sendMessage(chatId, message);
};

const job = async () => {
	try {
		logger.info('Job started...');

		await connectToDb(process.env.MONGO_URL);

		const subscriptions = await Subscription.find();
		const tiktokParser = new TiktokParser();

		const tasks = subscriptions.map(subscription => async () => {
			const { ttNickname, lastStreamAt: dbLastStreamAt } = subscription;

			try {
				const {
					isAlive,
					lastStreamAt: ttLastStreamAt,
					streamUrl,
				} = await tiktokParser.getLiveRoomInfo(ttNickname);

				if (process.stdout.isTTY) {
					logger.info(`Checked ${ttNickname}: alive=${isAlive} streamUrl:${streamUrl}`);
				}

				if (!shouldNotify(isAlive, ttLastStreamAt, dbLastStreamAt)) return false;
				
				subscription.lastStreamAt = ttLastStreamAt;
				await subscription.save();
				
				const message = `🔔 ${ttNickname} is live!${process.env.THUMBNAIL_FEATURE === 'true' && !streamUrl ? ' [THUMBNAIL]: Authorization required' : ''}\n${WEB_LIVE_URL.replace('{uniqueId}', ttNickname)}`;
				const thumbnail = process.env.THUMBNAIL_FEATURE === 'true' && streamUrl
					? await getThumbnail(streamUrl) 
					: null;

				await sendNotification(process.env.TG_CHAT_ID, message, thumbnail);

				return true;
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
