import mongoose from 'mongoose';

import { MONGO_URL, IS_PRODUCTION } from './config.js';
import { log } from './utils.js';

if (!IS_PRODUCTION) mongoose.set('debug', true);

await mongoose.connect(MONGO_URL);

process.once('SIGINT', () => mongoose.connection.close());
process.once('SIGTERM', () => mongoose.connection.close());

log('Database connected successfully!');

const { Schema, model } = mongoose;

const userSchema = new Schema({
  tgChatId: {
    type: Number,
    required: true,
    unique: true,
  },
	tgNickname: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

export const User = model('User', userSchema);

const subscriptionSchema = new Schema({
  ttNickname: {
    type: String,
    required: true,
    trim: true,
  },
	alive: {
		type: Boolean,
    required: true,
		default: false,
  },
  ttRoomId: {
		type: String,
    required: true,
  },
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	}
}, {
  timestamps: true,
});

export const Subscription = model('Subscription', subscriptionSchema);