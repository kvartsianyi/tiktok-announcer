const {
	API_URL,
	BOT_TOKEN,
	MONGO_URL,
	NODE_ENV,
	NOTIFICATIONS_JOB_SCHEDULE,
} = process.env;
let { PORT } = process.env;

PORT ??= 3000;

const IS_PRODUCTION = NODE_ENV.trim() === 'production';

const DEFAULT_TT_REQUEST_HEADERS = {
	Connection: 'keep-alive',
	'Cache-Control': 'max-age=0',
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
	Accept: 'text/html,application/json,application/protobuf',
	Referer: 'https://www.tiktok.com/',
	Origin: 'https://www.tiktok.com',
	'Accept-Language': 'en-US,en;q=0.9',
	'Accept-Encoding': 'gzip, deflate',
};
const DEFAULT_TT_CLIENT_PARAMS = {
	aid: 1988,
	app_language: 'en-US',
	app_name: 'tiktok_web',
	browser_language: 'en',
	browser_name: 'Mozilla',
	browser_online: true,
	browser_platform: 'Win32',
	browser_version: '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
	cookie_enabled: true,
	cursor: '',
	internal_ext: '',
	device_platform: 'web',
	focus_state: true,
	from_page: 'user',
	history_len: 0,
	is_fullscreen: false,
	is_page_visible: true,
	did_rule: 3,
	fetch_rule: 1,
	last_rtt: 0,
	live_id: 12,
	resp_content_type: 'protobuf',
	screen_height: 1152,
	screen_width: 2048,
	tz_name: 'Europe/Berlin',
	referer: 'https://www.tiktok.com/',
	root_referer: 'https://www.tiktok.com/',
	host: 'https://webcast.tiktok.com',
	webcast_sdk_version: '1.3.0',
	update_version_code: '1.3.0'
};
const WEB_LIVE_URL = 'https://www.tiktok.com/@{uniqueId}/live';
const API_LIVE_ROOM_URL = 'https://www.tiktok.com/api-live/user/room/';
const LIVE_STATUS = 2;

export {
	PORT,
	API_URL,
	BOT_TOKEN,
	MONGO_URL,
	NODE_ENV,
	IS_PRODUCTION,
	WEB_LIVE_URL,
	API_LIVE_ROOM_URL,
	LIVE_STATUS,
	DEFAULT_TT_REQUEST_HEADERS,
	DEFAULT_TT_CLIENT_PARAMS,
	NOTIFICATIONS_JOB_SCHEDULE,
};
