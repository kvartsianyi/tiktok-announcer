import { Telegraf } from 'telegraf';

import { BOT_TOKEN } from './config.js';
import {
	WELLCOM_MESSAGE,
	SUBSCRIBE_MESSAGE,
	UNSUBSCRIBE_MESSAGE,
} from './constants.js';
import { User, Subscription } from './database.js';
import { log, getTgChatId } from './utils.js';
import { TiktokParser } from './parser.js';

export const bot = new Telegraf(BOT_TOKEN);

bot.start(async ctx => {
	try {
		const from = ctx.update?.message?.from;
		const chatId = from?.id;
		const nickname = from?.first_name || from?.username;
		const user = await User.findOne({ tgChatId: chatId });

		if (!user) {
			const newUser = new User({
				tgChatId: chatId,
				tgNickname: nickname,
			});
			
			await newUser.save();
		}
		
		await ctx.replyWithHTML(WELLCOM_MESSAGE.replace('{nickname}', nickname));
	} catch (e) {
		log(e);
	}
});

bot.on('message', async ctx => {
	try {
		const chatId = getTgChatId(ctx);
		const ttNickname = ctx.message.text;
	
		const user = await User.findOne({ tgChatId: chatId });
		const subscription = await Subscription.findOne({
			ttNickname,
			user: user._id,
		});
	
		if (!subscription) {
			const { roomId: ttRoomId } = await TiktokParser.getStreamData(ttNickname);
			const newSubscription = new Subscription({
				ttNickname,
				ttRoomId,
				user,
			});
			await newSubscription.save();
			await ctx.replyWithHTML(SUBSCRIBE_MESSAGE.replace('{nickname}', ttNickname));
			return;
		}

		await subscription.deleteOne();
		await ctx.replyWithHTML(UNSUBSCRIBE_MESSAGE.replace('{nickname}', ttNickname));
	} catch (e) {
		log(e);
		await ctx.replyWithHTML(SOMETHING_WENT_WRONG_MESSAGE);
	}
});

export const sendMessage = async (chatId, message) =>
	bot.telegram.sendMessage(chatId, message);