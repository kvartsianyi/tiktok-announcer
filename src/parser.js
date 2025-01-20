import * as cheerio from 'cheerio';

import {
	TT_HEADERS,
	URL_WEB_LIVE,
	TT_API_CHECK_LIVE_URL,
} from './config.js';
import { log } from './utils.js';

export class TiktokParser {
	static async getStreamData(channel) {
		const { user } = await this.#getLiveRoomDetails(channel);

		return { roomId: user?.roomId };
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

		if (!sigiState?.LiveRoom) return null;

		return sigiState?.LiveRoom?.liveRoomUserInfo;
	}

	static async isAlive(roomId) {
		try {
			const liveUrl = TT_API_CHECK_LIVE_URL.replace('{roomIds}', roomId);
			const response = await fetch(liveUrl);
			const { data } = await response.json();

			return data[0]?.alive;
		} catch (e) {
			log(e);
		}
	}
}