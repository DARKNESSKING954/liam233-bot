// commands/media.js
// 🎬 LiamBot Media Commands

import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import fileType from 'file-type'; // ✅ Correct for CommonJS

// Helper: Get temp file path
function getTempFilePath(ext = '') {
  return path.join(os.tmpdir(), `temp_${Date.now()}${ext}`);
}

// 🧊 .sticker command
export async function sticker(sock, msg) {
  try {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    const mediaMsg = quoted?.quotedMessage ? { ...msg, message: quoted.quotedMessage } : msg;

    const mediaBuffer = await sock.downloadMediaMessage(mediaMsg);
    if (!mediaBuffer) {
      return sock.sendMessage(chatId, {
        text: "🖼️ Send or reply to an image/video with *.sticker* to convert it!",
      });
    }

    const type = await fileType.fromBuffer(mediaBuffer);
    if (!type || (!type.mime.startsWith('image') && !type.mime.startsWith('video'))) {
      return sock.sendMessage(chatId, {
        text: "⚠️ Invalid file. Please send or reply to an *image* or *short video*!",
      });
    }

    await sock.sendMessage(chatId, {
      sticker: mediaBuffer,
      packname: 'Whatsappbot Liam',
      author: 'Funny Stickers',
    });
  } catch (err) {
    console.error(err);
    return sock.sendMessage(msg.key.remoteJid, {
      text: "⚠️ Failed to create sticker. Try again!",
    });
  }
}

// 📽️ .youtube command
export async function youtube(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const query = args.join(' ');

  if (!query) {
    return sock.sendMessage(chatId, {
      text: "🔎 Usage: `.youtube [search term]` — I’ll grab a short video under 30 minutes!",
    });
  }

  try {
    const searchRes = await axios.get(`https://youtubei.js.org/api/search?q=${encodeURIComponent(query)}`);
    const video = searchRes.data?.results?.find(v => v.type === 'video' && v.durationSec <= 1800);

    if (!video || !video.url) {
      return sock.sendMessage(chatId, { text: "❌ Couldn't find any video!" });
    }

    const outPath = getTempFilePath('.mp4');
    const cmd = `yt-dlp -f "best[ext=mp4]" -o "${outPath}" "${video.url}"`;

    exec(cmd, async (err) => {
      if (err) {
        console.error(err);
        return sock.sendMessage(chatId, { text: "❌ Failed to download video with yt-dlp." });
      }

      const buffer = fs.readFileSync(outPath);
      await sock.sendMessage(chatId, {
        video: buffer,
        mimetype: 'video/mp4',
        caption: `🎬 *${video.title}*`,
      });

      fs.unlinkSync(outPath);
    });
  } catch (e) {
    console.error(e);
    return sock.sendMessage(chatId, { text: `❌ YouTube error: ${e.message}` });
  }
}

// 🐸 .meme command
export async function meme(sock, msg) {
  const chatId = msg.key.remoteJid;

  try {
    const res = await axios.get('https://meme-api.com/gimme');
    const meme = res.data;

    const imageRes = await axios.get(meme.url, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageRes.data, 'binary');

    await sock.sendMessage(chatId, {
      image: imageBuffer,
      caption: `🤣 *${meme.title}*\n👍 ${meme.ups} | 🧵 r/${meme.subreddit}`,
    });
  } catch (err) {
    console.error(err);
    return sock.sendMessage(chatId, {
      text: "⚠️ Couldn't fetch a meme. Try again later!",
    });
  }
}