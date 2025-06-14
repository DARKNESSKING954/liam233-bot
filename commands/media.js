// commands/media.js
// 🎬 LiamBot Media Commands

import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import fileType from 'file-type';

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
        text: "🖼️ *Sticker Maker*\nReply to an image/video with *.sticker* and I'll whip it into a fun sticker!",
      });
    }

    const type = await fileType.fromBuffer(mediaBuffer);
    if (!type || !['image', 'video'].some(t => type.mime.startsWith(t))) {
      return sock.sendMessage(chatId, {
        text: "⚠️ That doesn't look like an image or short video. Try again with valid media.",
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
      text: "😢 *Oops!* Something went wrong while making the sticker. Try again!",
    });
  }
}

// 📽️ .youtube command (manual video link only due to broken API)
export async function youtube(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const url = args.join(' ');

  if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
    return sock.sendMessage(chatId, {
      text: "📽️ *YouTube Downloader*\nUse `.youtube [YouTube URL]` to download a video under 30 minutes.\n_Example:_ `.youtube https://youtu.be/abc123`",
    });
  }

  try {
    const outPath = getTempFilePath('.mp4');
    const cmd = `yt-dlp -f "best[ext=mp4]" --max-filesize 200M -o "${outPath}" "${url}"`;

    await sock.sendMessage(chatId, { text: "⏳ Downloading your YouTube video, please wait..." });

    exec(cmd, async (err) => {
      if (err || !fs.existsSync(outPath)) {
        console.error(err);
        return sock.sendMessage(chatId, { text: "❌ Failed to download. Make sure the video is valid and under 30 minutes." });
      }

      const buffer = fs.readFileSync(outPath);
      await sock.sendMessage(chatId, {
        video: buffer,
        mimetype: 'video/mp4',
        caption: "🎬 Here's your video! Enjoy!",
      });

      fs.unlinkSync(outPath);
    });
  } catch (e) {
    console.error(e);
    return sock.sendMessage(chatId, { text: `🚫 Error downloading: ${e.message}` });
  }
}

// 🐸 .meme command
export async function meme(sock, msg) {
  const chatId = msg.key.remoteJid;

  try {
    const { data } = await axios.get('https://meme-api.com/gimme', { responseType: 'arraybuffer' });
    const meme = JSON.parse(Buffer.from(data).toString());

    const imageBuffer = Buffer.from(data);
    const imageType = await fileType.fromBuffer(imageBuffer);

    if (!imageType || !imageType.mime.startsWith('image/')) {
      return sock.sendMessage(chatId, { text: "⚠️ Couldn't fetch a proper meme image." });
    }

    await sock.sendMessage(chatId, {
      image: { url: meme.url },
      caption: `🤣 *${meme.title}*\n👍 ${meme.ups} | 🧵 r/${meme.subreddit}`,
    });
  } catch (err) {
    console.error(err);
    return sock.sendMessage(chatId, {
      text: "😓 Couldn't fetch a meme. Meme gods are sleeping, try again later!",
    });
  }
}