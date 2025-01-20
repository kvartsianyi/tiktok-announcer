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
					ttRoomId,
					alive: dbAlive,
					user,
				} = subscription;
				const ttAlive = await TiktokParser.isAlive(ttRoomId);
				await sleep(100); // To avoid tiktok shadow ban
				
				if (dbAlive !== ttAlive) {
					subscription.alive = ttAlive;
					await subscription.save();
				};

				const shouldNotify = !dbAlive && ttAlive;
				if (!shouldNotify) continue;

				const dbUser = await User.findOne({ _id: user });
				if (!dbUser) throw new Error('User not found');

				const message = `🔔 ${ttNickname} is live!\n${URL_WEB_LIVE.replace('{channel}', ttNickname)}`;

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
	cronTime: '* * * * *',
	onTick: notificationJob,
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