// commands/media.js
// 🎬 LiamBot Media Commands

import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import fileType from 'file-type';
import googleTTS from 'google-tts-api';
import { downloadMediaMessage } from '@whiskeysockets/baileys'; // ✅ FIXED

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

    await sock.sendMessage(chatId, {
      sticker: mediaBuffer,
      packname: 'Liambot',
      author: 'Funny Stickers',
    });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chatId, {
      text: "❌ Error creating sticker. Try again with a valid image/video.",
    });
  }
}

// 📽️ .youtube command
export async function youtube(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const query = args.join(' ').trim();

  if (!query) {
    return await sock.sendMessage(chatId, {
      text: "📽️ YouTube Downloader\nUsage: .youtube [search or link]",
    });
  }

  const outPath = getTempFilePath('.mp4');
  const searchParam = query.includes('http') ? query : `ytsearch1:${query}`;
  const cmd = `yt-dlp -f "best[ext=mp4]" --write-thumbnail --write-info-json -o "${outPath}" "${searchParam}"`;

  try {
    await sock.sendMessage(chatId, { text: "📥 Downloading video, please wait..." });

    exec(cmd, async (err) => {
      if (err || !fs.existsSync(outPath)) {
        console.error(err);
        return await sock.sendMessage(chatId, {
          text: "❌ Download failed. Try another video or search keyword.",
        });
      }

      const jsonPath = outPath.replace('.mp4', '.info.json');
      const jsonData = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath)) : {};
      const title = jsonData.title || 'Unknown Title';
      const thumbnailPath = outPath.replace('.mp4', '.jpg');
      const thumbnail = fs.existsSync(thumbnailPath) ? fs.readFileSync(thumbnailPath) : null;

      const videoBuffer = fs.readFileSync(outPath);
      await sock.sendMessage(chatId, {
        video: videoBuffer,
        mimetype: 'video/mp4',
        caption: `🎬 ${title}`,
        ...(thumbnail && { jpegThumbnail: thumbnail }),
      });

      // Cleanup
      fs.unlinkSync(outPath);
      if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
      if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
    });

  } catch (e) {
    console.error(e);
    await sock.sendMessage(chatId, { text: `❌ Error: ${e.message}` });
  }
}

// 🎵 .play command
export async function play(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const query = args.join(' ').trim();

  if (!query) {
    return await sock.sendMessage(chatId, {
      text: "🎶 Play Music\nUsage: .play [song or link]\n_Example:_ .play Blinding Lights",
    });
  }

  const outPath = getTempFilePath('.mp3');
  const cmd = `yt-dlp -x --audio-format mp3 --write-info-json --write-thumbnail -o "${outPath}" "ytsearch1:${query}"`;

  try {
    await sock.sendMessage(chatId, { text: "🎧 Fetching your song..." });

    exec(cmd, async (err) => {
      if (err || !fs.existsSync(outPath)) {
        console.error(err);
        return await sock.sendMessage(chatId, {
          text: "❌ Couldn't fetch audio. Try a different song or check the link.",
        });
      }

      const jsonPath = outPath.replace('.mp3', '.info.json');
      const jsonData = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath)) : {};
      const title = jsonData.title || query;
      const thumbnailPath = outPath.replace('.mp3', '.jpg');
      const thumbnail = fs.existsSync(thumbnailPath) ? fs.readFileSync(thumbnailPath) : null;

      const audio = fs.readFileSync(outPath);
      await sock.sendMessage(chatId, {
        audio,
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: 'song.mp3',
        caption: `🎵 ${title}`,
        ...(thumbnail && { jpegThumbnail: thumbnail }),
      });

      // Cleanup
      fs.unlinkSync(outPath);
      if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
      if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
    });

  } catch (e) {
    console.error(e);
    await sock.sendMessage(chatId, { text: `❌ Error: ${e.message}` });
  }
}

// 🐸 .meme command
export async function meme(sock, msg) {
  const chatId = msg.key.remoteJid;
  try {
    const res = await axios.get('https://meme-api.com/gimme');
    const meme = res.data;

    await sock.sendMessage(chatId, {
      image: { url: meme.url },
      caption: `🤣 *${meme.title}*\n👍 ${meme.ups} | r/${meme.subreddit}`,
    });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chatId, {
      text: "😓 Meme gods are asleep. Try again in a bit!",
    });
  }
}

// 🔊 .tts command
export async function tts(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const text = args.join(' ').trim();

  if (!text) {
    return await sock.sendMessage(chatId, {
      text: "🔊 Text-to-Speech\nUsage: .tts Hello world\nSupported language: English only",
    });
  }

  try {
    const url = googleTTS.getAudioUrl(text, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });

    const audio = (await axios.get(url, { responseType: 'arraybuffer' })).data;

    await sock.sendMessage(chatId, {
      audio,
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: 'tts.mp3',
      caption: '🗣️ Here you go!',
    });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chatId, {
      text: "❌ Failed to generate speech. Try again later.",
    });
  }
}