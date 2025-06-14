// commands/media.js
// 🎬 LiamBot Media Commands

import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import fileType from 'file-type'; // ✅ Use default import for CommonJS module

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
        text: "🖼️ Send or reply to an image/video/sticker with *.sticker* to convert it!",
      });
    }

    const type = await fileType.fromBuffer(mediaBuffer);
    if (!type || !['image', 'video'].some(t => type.mime.startsWith(t))) {
      return sock.sendMessage(chatId, {
        text: "⚠️ Invalid media. Please send or reply to an *image* or *short video*!",
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
    const searchRes = await axios.get(`https://ytapi.llama.sh/search?q=${encodeURIComponent(query)}`);
    const video = searchRes.data?.videos?.[0];

    if (!video || !video.url) {
      return sock.sendMessage(chatId, { text: "❌ Couldn't find any video!" });
    }

    if (video.duration.seconds > 1800) {
      return sock.sendMessage(chatId, {
        text: "⏰ That video is longer than 30 minutes! Try a shorter one.",
      });
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
    const response = await axios.get('https://meme-api.com/gimme');
    const meme = response.data;

    await sock.sendMessage(chatId, {
      image: { url: meme.url },
      caption: `🤣 *${meme.title}*\n👍 ${meme.ups} | 🧵 r/${meme.subreddit}`,
    });
  } catch (err) {
    console.error(err);
    return sock.sendMessage(chatId, {
      text: "⚠️ Couldn't fetch a meme. Try again later!",
    });
  }
}