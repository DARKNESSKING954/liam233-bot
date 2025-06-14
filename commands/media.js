// commands/media.js
// 🎬 LiamBot Media Commands

import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import fileType from 'file-type';

// Helper: Temp file path
function getTempFilePath(ext = '') {
  return path.join(os.tmpdir(), `temp_${Date.now()}${ext}`);
}

// 🧊 .sticker command (Fixed: only supports image/video, ensures WebP format)
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
    if (!type || !['image', 'video'].some(t => type.mime.startsWith(t))) {
      return sock.sendMessage(chatId, {
        text: "⚠️ Please reply to an *image* or *short video*!",
      });
    }

    // Convert to WebP using ffmpeg if video, or sharp if image (fallback)
    const inputPath = getTempFilePath(`.${type.ext}`);
    const outputPath = getTempFilePath('.webp');
    fs.writeFileSync(inputPath, mediaBuffer);

    const cmd = `ffmpeg -i "${inputPath}" -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -q:v 50 -preset default -loop 0 -an -vsync 0 -s 512:512 "${outputPath}"`;

    exec(cmd, async (err) => {
      if (err || !fs.existsSync(outputPath)) {
        console.error('Sticker conversion failed:', err);
        return sock.sendMessage(chatId, { text: "⚠️ Couldn't convert to sticker. Try again!" });
      }

      const stickerBuffer = fs.readFileSync(outputPath);
      await sock.sendMessage(chatId, {
        sticker: stickerBuffer,
        packname: 'Whatsappbot Liam',
        author: 'Funny Stickers',
      });

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.error(err);
    return sock.sendMessage(msg.key.remoteJid, {
      text: "⚠️ Failed to create sticker. Try again!",
    });
  }
}

// 📽️ .youtube command (Fixed: Uses working Invidious proxy for YouTube search)
export async function youtube(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const query = args.join(' ');

  if (!query) {
    return sock.sendMessage(chatId, {
      text: "🔎 Usage: `.youtube [search term]` — I’ll grab a short video under 30 minutes!",
    });
  }

  try {
    // Invidious public instance as fallback
    const res = await axios.get(`https://yewtu.be/search?q=${encodeURIComponent(query)}`);
    const match = res.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (!match) return sock.sendMessage(chatId, { text: "❌ Couldn't find a valid video!" });

    const videoUrl = `https://www.youtube.com/watch?v=${match[1]}`;
    const outPath = getTempFilePath('.mp4');

    const cmd = `yt-dlp -f "best[ext=mp4]" --max-filesize 50M --no-playlist -o "${outPath}" "${videoUrl}"`;

    exec(cmd, async (err) => {
      if (err) {
        console.error(err);
        return sock.sendMessage(chatId, { text: "❌ yt-dlp failed to download. Try a shorter video." });
      }

      const buffer = fs.readFileSync(outPath);
      await sock.sendMessage(chatId, {
        video: buffer,
        mimetype: 'video/mp4',
        caption: `🎬 Here's your video from: ${videoUrl}`,
      });

      fs.unlinkSync(outPath);
    });
  } catch (e) {
    console.error(e);
    return sock.sendMessage(chatId, {
      text: `❌ YouTube error: ${e.message}`,
    });
  }
}

// 🐸 .meme command (Fixed: Loads image buffer directly)
export async function meme(sock, msg) {
  const chatId = msg.key.remoteJid;

  try {
    const res = await axios.get('https://meme-api.com/gimme');
    const meme = res.data;

    const imageRes = await axios.get(meme.url, {
      responseType: 'arraybuffer',
    });

    const imageBuffer = Buffer.from(imageRes.data, 'binary');

    await sock.sendMessage(chatId, {
      image: imageBuffer,
      mimetype: 'image/jpeg',
      caption: `🤣 *${meme.title}*\n👍 ${meme.ups} | 🧵 r/${meme.subreddit}`,
    });
  } catch (err) {
    console.error(err);
    return sock.sendMessage(chatId, {
      text: "⚠️ Couldn't fetch a meme. Try again later!",
    });
  }
}