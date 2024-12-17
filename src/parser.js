import * as cheerio from 'cheerio';

import {
	TT_HEADERS,
	URL_WEB_LIVE,
	LIVE_STATUS,
} from './config.js';

export class TiktokParser {
	static async getStreamStats(channel) {
		const liveRoomInfo = await this.#getLiveRoomDetails(channel);
	
		return {
			isAlive: Boolean(liveRoomInfo?.status === LIVE_STATUS),
			lastLiveStart: liveRoomInfo.startTime,
		};
	}

	static async #getLiveRoomDetails(channel) {
		const liveUrl = URL_WEB_LIVE.replace("{channel}", channel);
		const options = { headers: TT_HEADERS };
		const response = await fetch(liveUrl, options);
		const pageHtml = await response.text();
		
		const $ = cheerio.load(pageHtml);
		const sigiScript = $('#SIGI_STATE').html();

		if (!sigiScript) throw new Error('Can\'t find #SIGI_STATE');
		
		const sigiState = JSON.parse(sigiScript);

		if (!sigiState?.LiveRoom) throw new Error('Can\'t find LiveRoom in #SIGI_STATE');

		const liveRoomInfo = sigiState?.LiveRoom?.liveRoomUserInfo?.liveRoom;

		return liveRoomInfo;
	}
}