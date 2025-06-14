// commands/media.js
// 🎬 LiamBot Media Commands

import axios from 'axios';
import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import fileType from 'file-type';
import googleTTS from 'google-tts-api';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

// Helper: Get temp file path
function getTempFilePath(ext = '') {
  return path.join(os.tmpdir(), `liambot_${Date.now()}${ext}`);
}

// 🧊 .sticker command
export async function sticker(sock, msg) {
  const chatId = msg.key.remoteJid;
  try {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) {
      return await sock.sendMessage(chatId, {
        text: "🖼️ Sticker Maker\n_Reply to an image or short video with .sticker_ to create a cool sticker!",
      });
    }

    const quotedMsg = {
      key: {
        remoteJid: chatId,
        id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId,
        participant: msg.message?.extendedTextMessage?.contextInfo?.participant,
      },
      message: quoted,
    };

    const mediaBuffer = await downloadMediaMessage(quotedMsg, 'buffer', {}, { logger: console });

    if (!mediaBuffer) {
      return await sock.sendMessage(chatId, {
        text: "⚠️ Couldn't download media. Make sure it's a valid image or short video.",
      });
    }

    const type = await fileType.fromBuffer(mediaBuffer);
    if (!type || (!type.mime.startsWith('image') && !type.mime.startsWith('video'))) {
      return await sock.sendMessage(chatId, {
        text: "❌ Only images or short videos (under 10s) are supported for stickers.",
      });
    }

    const inputPath = getTempFilePath(`.${type.ext}`);
    const outputPath = getTempFilePath('.webp');
    fs.writeFileSync(inputPath, mediaBuffer);

    const isVideo = type.mime.startsWith('video');
    const ffmpegCmd = isVideo
      ? `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -ss 0 -t 10 -loop 0 -preset default -an -vsync 0 -s 512:512 "${outputPath}"`
      : `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease" -vcodec libwebp -lossless 1 -qscale 50 -preset default -an -vsync 0 "${outputPath}"`;

    execSync(ffmpegCmd);

    const sticker = fs.readFileSync(outputPath);
    await sock.sendMessage(chatId, {
      sticker,
      packname: 'Liambot',
      author: 'Funny Stickers',
    });

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chatId, {
      text: "❌ Error creating sticker. Try again with a clear image or short video (under 10s).",
    });
  }
}

// 📽️ .youtube command (unchanged) ...

// 🎵 .play command (unchanged) ...

// 🐸 .meme command (image only)
export async function meme(sock, msg) {
  const chatId = msg.key.remoteJid;
  try {
    const res = await axios.get('https://meme-api.com/gimme');
    const meme = res.data;

    const imageRes = await axios.get(meme.url, { responseType: 'arraybuffer' });
    const buffer = imageRes.data;
    const type = await fileType.fromBuffer(buffer);

    if (!type?.mime.startsWith('image')) {
      return await sock.sendMessage(chatId, {
        text: "⚠️ Received a non-image meme. Try `.memegif` for animated memes!",
      });
    }

    await sock.sendMessage(chatId, {
      image: buffer,
      caption: `🤣 *${meme.title}*\n👍 ${meme.ups} | r/${meme.subreddit}`,
    });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chatId, {
      text: "😓 Meme gods are asleep. Try again in a bit!",
    });
  }
}

// 🎞️ .memegif command (handles GIFs only)
export async function memegif(sock, msg) {
  const chatId = msg.key.remoteJid;
  try {
    let tries = 0;
    let meme, buffer, type;

    // Try until we find a gif
    while (tries < 5) {
      const res = await axios.get('https://meme-api.com/gimme');
      meme = res.data;

      const gifRes = await axios.get(meme.url, { responseType: 'arraybuffer' });
      buffer = gifRes.data;
      type = await fileType.fromBuffer(buffer);

      if (type?.mime === 'image/gif') break;
      tries++;
    }

    if (type?.mime !== 'image/gif') {
      return await sock.sendMessage(chatId, {
        text: "❌ Couldn't find a GIF meme after several tries. Try again!",
      });
    }

    await sock.sendMessage(chatId, {
      video: buffer,
      mimetype: 'video/gif',
      caption: `😂 *${meme.title}*\n👍 ${meme.ups} | r/${meme.subreddit}`,
    });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chatId, {
      text: "😭 No GIF memes found. Try again later!",
    });
  }
}

// 🔊 .tts command (unchanged) ...