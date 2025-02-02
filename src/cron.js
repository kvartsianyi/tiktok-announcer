import { CronJob } from 'cron';

import { Subscription, User } from './database.js';
import { WEB_LIVE_URL, API_URL } from './config.js'
import { TiktokParser } from './parser.js';
import { sendMessage } from './bot.js';
import { log, sleep } from './utils.js';

const notificationJob = async () => {
	try {
		const subscriptions = await Subscription.find();

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
				} = await tiktokParser.getLiveRoomInfo(ttNickname);
				
				const isDifferentStream = dbStreamAt < updatedStreamAt;
				const sendNotification = isAlive && isDifferentStream;

				if (sendNotification) {
					subscription.lastStreamAt = updatedStreamAt;
					subscription.save();
	
					const dbUser = await User.findOne({ _id: user });
					if (!dbUser) throw new Error('User not found');
	
					const message = `🔔 ${ttNickname} is live!\n${WEB_LIVE_URL.replace('{uniqueId}', ttNickname)}`;
					await sendMessage(dbUser.tgChatId, message);
				};

				// Trottle to avoid rate limiting from TikTok
				await sleep(1000);
			} catch (e) {
				log(e);
			}
		}
	} catch (e) {
		log(e);
	}
};

const notifications = CronJob.from({
	cronTime: '*/5 * * * *',
	onTick: notificationJob,
	waitForCompletion: true,
});
notifications.start();

const keepServerAliveJob = async () => {
	try {
		const res = await fetch(API_URL);

		if (res.status === 200) {
			log('Server\'s life extended successfully.');
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