import axios from 'axios';
import FormData from 'form-data';

const telegramApi = axios.create({
	baseURL: `https://api.telegram.org/bot${process.env.BOT_TOKEN}`,
	timeout: 10000,
});

export const sendMessage = async (chatId, text) => {
	return telegramApi.post('/sendMessage', {
		chat_id: chatId,
		text,
	});
};

export const sendPhoto = async (chatId, caption, buffer, filename = "image.jpg") => {
	const form = new FormData();

  form.append('chat_id', chatId);
  form.append('caption', caption);

	form.append('photo', buffer, {
    filename,
    contentType: 'image/jpeg',
  });

  return telegramApi.post('/sendPhoto', form);
};