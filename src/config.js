let {
	PORT,
	API_URL,
	BOT_TOKEN,
	MONGO_URL,
	NODE_ENV,
} = process.env;

const TT_HEADERS = {
	Connection: 'keep-alive',
	'Cache-Control': 'max-age=0',
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
	Accept: 'text/html,application/json,application/protobuf',
	Referer: 'https://www.tiktok.com/',
	Origin: 'https://www.tiktok.com',
	'Accept-Language': 'en-US,en;q=0.9',
	'Accept-Encoding': 'gzip, deflate',
};
const URL_WEB_LIVE = "https://www.tiktok.com/@{channel}/live";
const LIVE_STATUS = 2;
const IS_PRODUCTION = NODE_ENV.trim() === 'production';

PORT ??= 3000;

export {
	TT_HEADERS,
	URL_WEB_LIVE,
	LIVE_STATUS,
	PORT,
	API_URL,
	BOT_TOKEN,
	MONGO_URL,
	IS_PRODUCTION,
};
