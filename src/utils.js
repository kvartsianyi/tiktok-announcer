import { logger } from './logger.js';

export const sleep = ms => new Promise(res => setTimeout(res, ms));

export const runWithDelay = async (tasks, delayMs = 500) => {
  const results = [];

  for (const task of tasks) {
    try {
      const result = await task();
      results.push({ status: 'fulfilled', value: result });
    } catch (error) {
      results.push({ status: 'rejected', reason: error });
    }

    if (delayMs) {
      await sleep(delayMs);
    }
  }

  return results;
};

export const createJobTimer = (jobName = 'Job') => {
  const start = Date.now();

  return () => {
    const durationMs = Date.now() - start;
    const durationSec = (durationMs / 1000).toFixed(2);
    logger.info(`${jobName} finished in ${durationSec}s`);
  };
};

export const withTimer = (fn, jobName = 'Job') => async (...args) => {
  const stopTimer = createJobTimer(jobName);
  const result = await fn(...args);
  stopTimer();
  return result;
};