import mongoose from 'mongoose';

import { logger } from './logger.js';

export const connectToDb = async (url) => {
  await mongoose.connect(url, {
    serverSelectionTimeoutMS: 10000,
  });
  logger.info('Database connected!');
};

export const closeDbConnection = async () => {
  await mongoose.connection.close();
  logger.info('Database connection closed!');
};

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

export const User = mongoose.models.User || model('User', userSchema);

const subscriptionSchema = new Schema({
  ttNickname: {
    type: String,
    required: true,
    trim: true,
  },
	lastStreamAt: {
		type: Number,
		default: null,
  },
  user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
}, {
  timestamps: true,
});

export const Subscription = mongoose.models.Subscription || model('Subscription', subscriptionSchema);