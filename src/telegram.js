import axios from 'axios';

export const sendTelegramMessage = async (chatId, text) => {
	const telegram = axios.create({
		baseURL: `https://api.telegram.org/bot${process.env.BOT_TOKEN}`,
		timeout: 10000,
	});

	await telegram.post('/sendMessage', {
		chat_id: chatId,
		text,
	});
};