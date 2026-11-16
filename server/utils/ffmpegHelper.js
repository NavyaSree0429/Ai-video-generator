const ffmpeg = require('fluent-ffmpeg');
let ffmpegPath = null;

try {
  ffmpegPath = require('ffmpeg-static');
  if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
    console.log(`[FFmpeg] Using static FFmpeg binary at: ${ffmpegPath}`);
  }
} catch (err) {
  console.warn('[FFmpeg] ffmpeg-static not loaded, will rely on system PATH.');
}

const getFFmpegStatus = () => ({
  available: !!ffmpegPath,
  path: ffmpegPath || 'system-path'
});

module.exports = {
  ffmpeg,
  ffmpegPath,
  getFFmpegStatus
};

