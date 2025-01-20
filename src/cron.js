import { CronJob } from 'cron';

import { Subscription, User } from './database.js';
import { URL_WEB_LIVE, API_URL } from './config.js'
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
				const {
					isAlive,
					lastStreamAt: updatedStreamAt,
				} = await TiktokParser.getStreamStats(ttNickname);
				await sleep(1000);
				
				const isStreamNew = dbStreamAt < updatedStreamAt;
				if (!isAlive || !isStreamNew) continue;

				subscription.lastStreamAt = updatedStreamAt;
				subscription.save();

				const dbUser = await User.findOne({ _id: user });
				if (!dbUser) throw new Error('User not found');

				const message = `🔔 ${ttNickname} is live! ${URL_WEB_LIVE.replace('{channel}', ttNickname)}`;

				await sendMessage(dbUser.tgChatId, message);
			} catch (e) {
				log(e);
			}
		}
	} catch (e) {
		log(e);
	}
};

const notifications = CronJob.from({
	cronTime: '*/3 * * * *',
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