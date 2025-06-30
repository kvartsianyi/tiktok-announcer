import { PassThrough } from 'node:stream';

import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

import { FFMPEG_SCREENSHOT_OPTIONS } from './config.js';

ffmpeg.setFfmpegPath(ffmpegPath);


export const captureScreenshot = async (streamUrl) => {
  return new Promise((resolve, reject) => {
    const stream = new PassThrough();
    const chunks = [];

    ffmpeg(streamUrl)
      .inputOptions(FFMPEG_SCREENSHOT_OPTIONS.inputOptions)
      .outputFormat(FFMPEG_SCREENSHOT_OPTIONS.outputFormat)
      .outputOptions(FFMPEG_SCREENSHOT_OPTIONS.outputOptions)
      // .on('start', cmd => console.log('[FFmpeg]', cmd))
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe(stream, { end: true });

    stream.on('data', chunk => chunks.push(chunk));
  });
};