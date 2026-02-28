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
}, {
  timestamps: true,
});

export const Subscription = mongoose.models.Subscription || model('Subscription', subscriptionSchema);