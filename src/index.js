import { CHANNELS } from './config.js';
import { TiktokParser } from './parser.js';

for(const channel of CHANNELS) {
	const {
		isAlive,
		lastLiveStart,
	} = await TiktokParser.getStreamStats(channel);

	const formatedDate = new Date(lastLiveStart * 1000).toISOString();
	console.log(`${channel} is ${isAlive ? 'live!' : `offline. Last seen at ${formatedDate}`}`);
}