import axios from 'axios';
import * as cheerio from 'cheerio';

import {
	WEB_LIVE_URL,
	API_LIVE_ROOM_URL,
	LIVE_STATUS,
	DEFAULT_TT_REQUEST_HEADERS,
	DEFAULT_TT_CLIENT_PARAMS,
} from './config.js';

export class TiktokParser {
	#httpClient;

	constructor() {
		this.#httpClient = axios.create({
      timeout: 10000,
      headers: DEFAULT_TT_REQUEST_HEADERS,
    });
	}

	/**
   * Get live room details
   * @param {string} uniqueId TikTok username (from URL)
    */
	async getLiveRoomInfo(uniqueId) {
		let liveRoomInfo = {};

		try {
			try {
				liveRoomInfo = await this.#getLiveRoomInfoFromApi(uniqueId);
			} catch (e) {
				// Use fallback method
				liveRoomInfo = await this.#getLiveRoomInfoFromHtml(uniqueId);
			}
		} catch (e) {
			throw new Error(`Failed to retrieve live room info for ${uniqueId}. ${err.message}`);
		}

		return {
			isAlive: liveRoomInfo ? Boolean(liveRoomInfo.status === LIVE_STATUS) : false,
			lastStreamAt: liveRoomInfo ? liveRoomInfo.startTime : null,
		};
	}

	async #getLiveRoomInfoFromHtml(uniqueId) {
		const liveUrl = WEB_LIVE_URL.replace("{uniqueId}", uniqueId);
		const { data: pageHtml } = await this.#httpClient(liveUrl);
		
		const $ = cheerio.load(pageHtml);
		const sigiScript = $('#SIGI_STATE').html();

		if (!sigiScript) {
			throw new Error(`Can\'t find #SIGI_STATE for ${uniqueId}`);
		}
		
		const sigiState = JSON.parse(sigiScript);

		if (!sigiState?.LiveRoom) return null;

		const liveRoomInfo = sigiState?.LiveRoom?.liveRoomUserInfo?.liveRoom;

		return liveRoomInfo;
	}

	async #getLiveRoomInfoFromApi(uniqueId) {
		const { data: liveRoomResponse } = await this.#httpClient(API_LIVE_ROOM_URL, {
			params: { 
				...DEFAULT_TT_CLIENT_PARAMS,
				uniqueId,
				sourceType: 54, // Magic number from TikTok
			},
		});

		const liveRoomInfo = liveRoomResponse?.data?.liveRoom;

		return liveRoomInfo;
	}
}