import { CronJob } from 'cron';

import { Subscription, User } from './database.js';
import { URL_WEB_LIVE } from './config.js'
import { TiktokParser } from './parser.js';
import { sendMessage } from './bot.js';
import { log, sleep } from './utils.js';

const jobFn = async () => {
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
				
				const isStreamNew = dbStreamAt < updatedStreamAt;
				if (!isAlive || !isStreamNew) continue;

				subscription.lastStreamAt = updatedStreamAt;
				subscription.save();

				const dbUser = await User.findOne({ _id: user });
				if (!dbUser) throw new Error('User not found');

				const message = `🔔 ${ttNickname} is live! ${URL_WEB_LIVE.replace('{channel}', ttNickname)}`;

				await sendMessage(dbUser.tgChatId, message);
				await sleep(100);
			} catch (e) {
				log(e);
			}
		}
	} catch (e) {
		log(e);
	}
};

const job = CronJob.from({
	cronTime: '* * * * *',
	onTick: jobFn,
});
job.start();