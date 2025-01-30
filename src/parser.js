import * as cheerio from 'cheerio';

import {
	TT_HEADERS,
	URL_WEB_LIVE,
	LIVE_STATUS,
} from './config.js';
import { log } from './utils.js';

export class TiktokParser {
	static async getStreamStats(channel) {
		const liveRoomInfo = await this.#getLiveRoomDetails(channel);
	
		return {
			isAlive: liveRoomInfo ? Boolean(liveRoomInfo.status === LIVE_STATUS) : false,
			lastStreamAt: liveRoomInfo ? liveRoomInfo.startTime : null,
		};
	}

	static async #getLiveRoomDetails(channel) {
		const liveUrl = URL_WEB_LIVE.replace("{channel}", channel);
		const options = { headers: TT_HEADERS };
		const response = await fetch(liveUrl, options);
		const pageHtml = await response.text();
		
		const $ = cheerio.load(pageHtml);
		const sigiScript = $('#SIGI_STATE').html();

		if (!sigiScript) {
			log(`Can\'t find #SIGI_STATE for ${channel}`);
			log('Page html:', pageHtml);
			throw new Error('Can\'t find #SIGI_STATE');
		}
		
		const sigiState = JSON.parse(sigiScript);

		if (!sigiState?.LiveRoom) return null;

		const liveRoomInfo = sigiState?.LiveRoom?.liveRoomUserInfo?.liveRoom;

		return liveRoomInfo;
	}
}