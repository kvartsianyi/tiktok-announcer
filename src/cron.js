import { CronJob } from 'cron';
import axios from 'axios';

import { Subscription, User } from './database.js';
import {
	WEB_LIVE_URL,
	API_URL,
	NOTIFICATIONS_JOB_SCHEDULE,
} from './config.js'
import { TiktokParser } from './parser.js';
import { sendMessage, sendPhoto } from './bot.js';
import { log, sleep } from './utils.js';
import { captureScreenshot } from './ffmpeg.js';

const notificationsJob = async () => {
	try {
		log('[notificationsJob] 📬 Job started...');

		const subscriptions = await Subscription.find();
		let notificationsCount = 0;

		for(const subscription of subscriptions) {
			try {
				const {
					ttNickname,
					lastStreamAt: dbStreamAt,
					user,
				} = subscription;
				const tiktokParser = new TiktokParser();
				const {
					isAlive,
					lastStreamAt: updatedStreamAt,
					streamUrl,
				} = await tiktokParser.getLiveRoomInfo(ttNickname);
				
				const isDifferentStream = dbStreamAt < updatedStreamAt;
				const sendNotification = isAlive && isDifferentStream;

				if (sendNotification) {
					subscription.lastStreamAt = updatedStreamAt;
					subscription.save();
	
					const dbUser = await User.findOne({ _id: user });
					if (!dbUser) throw new Error('User not found');
	
					const message = `🔔 ${ttNickname} is live!\n${WEB_LIVE_URL.replace('{uniqueId}', ttNickname)}`;

					let thumbnail;
					if (streamUrl) {
						try {
							thumbnail = await captureScreenshot(streamUrl);
						} catch (e) {
							log(`[notificationsJob] Error capturing screenshot for ${ttNickname}:`, e);
							thumbnail = null;
						}
					}

					if (thumbnail) {
						await sendPhoto(dbUser.tgChatId, thumbnail, message);
					} else {
						await sendMessage(dbUser.tgChatId, message);
					}

					notificationsCount++;
				};

				// Trottle to avoid rate limiting from TikTok
				await sleep(1000);
			} catch (e) {
				log(e);
			}
		}

		log('[notificationsJob] 📬 Job completed. Notifications sent:', notificationsCount);
	} catch (e) {
		log(e);
	}
};

const notifications = CronJob.from({
	cronTime: NOTIFICATIONS_JOB_SCHEDULE,
	onTick: notificationsJob,
	waitForCompletion: true,
});
notifications.start();

const keepServerAliveJob = async () => {
	try {
		const res = await axios.get(API_URL);

		if (res.status === 200) {
			log('💖 Server\'s life extended successfully.');
		} else {
			log('Failed to extend Server\'s life.');
		}
	} catch	(e) {
		log(e);
	}
}

const keepServerAlive = CronJob.from({
	cronTime: '*/10 * * * *',
	onTick: keepServerAliveJob,
});
keepServerAlive.start();