// commands/media.js
// 🎬 LiamBot Media Commands

import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import fileType from 'file-type';
import googleTTS from 'google-tts-api';

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
      return sock.sendMessage(chatId, {
        text: "🖼️ Sticker Maker\n_Reply to an image or short video with .sticker_ to create a cool sticker!",
      });
    }

    const mediaBuffer = await sock.downloadMediaMessage({ message: quoted });
    if (!mediaBuffer) {
      return sock.sendMessage(chatId, {
        text: "⚠️ Couldn't download media. Make sure it's a valid image or short video.",
      });
    }

    const type = await fileType.fromBuffer(mediaBuffer);
    if (!type || (!type.mime.startsWith('image') && !type.mime.startsWith('video'))) {
      return sock.sendMessage(chatId, {
        text: "❌ Only images or videos under 10s allowed for sticker creation.",
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
  const url = args.join(' ').trim();

  if (!url || !url.includes('youtu')) {
    return sock.sendMessage(chatId, {
      text: "📽️ YouTube Downloader\n_Usage:_ .youtube https://youtu.be/xyz (under 30 mins)",
    });
  }

  const outPath = getTempFilePath('.mp4');
  const cmd = `yt-dlp -f "best[ext=mp4][duration<=1800]" --max-filesize 200M -o "${outPath}" "${url}"`;

  try {
    await sock.sendMessage(chatId, { text: "📥 Downloading video, please wait..." });

    exec(cmd, async (err) => {
      if (err || !fs.existsSync(outPath)) {
        console.error(err);
        return sock.sendMessage(chatId, {
          text: "❌ Download failed. Ensure video is under 30 minutes and under 200MB.",
        });
      }

      const videoBuffer = fs.readFileSync(outPath);
      await sock.sendMessage(chatId, {
        video: videoBuffer,
        mimetype: 'video/mp4',
        caption: "🎬 Here's your video!",
      });

      fs.unlinkSync(outPath);
    });

  } catch (e) {
    console.error(e);
    sock.sendMessage(chatId, {
      text: `❌ Error: ${e.message}`,
    });
  }
}

// 🎵 .play command
export async function play(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const query = args.join(' ').trim();

  if (!query) {
    return sock.sendMessage(chatId, {
      text: "🎶 Play Music\nUsage: .play [song or link]\n_Example:_ .play Blinding Lights",
    });
  }

  const outPath = getTempFilePath('.mp3');
  const ytQuery = query.includes('youtube.com') || query.includes('youtu.be')
    ? query
    : `ytsearch1:${query}`;
  const cmd = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outPath}" "${ytQuery}"`;

  try {
    await sock.sendMessage(chatId, { text: "🎧 Fetching your song..." });

    exec(cmd, async (err) => {
      if (err || !fs.existsSync(outPath)) {
        console.error(err);
        return sock.sendMessage(chatId, {
          text: "❌ Couldn't fetch audio. Try a different song or check the link.",
        });
      }

      const audio = fs.readFileSync(outPath);
      await sock.sendMessage(chatId, {
        audio,
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: 'song.mp3',
        caption: `🎶 Here's your track: *${query}*`,
      });

      fs.unlinkSync(outPath);
    });

  } catch (e) {
    console.error(e);
    sock.sendMessage(chatId, {
      text: `❌ Error: ${e.message}`,
    });
  }
}

// 🐸 .meme command
export async function meme(sock, msg) {
  const chatId = msg.key.remoteJid;
  try {
    const { data: meme } = await axios.get('https://meme-api.com/gimme');

    if (!meme?.url) {
      return sock.sendMessage(chatId, {
        text: "❌ Couldn't fetch a meme. Try again later.",
      });
    }

    await sock.sendMessage(chatId, {
      image: { url: meme.url },
      caption: `🤣 *${meme.title}*\n👍 ${meme.ups} | r/${meme.subreddit}`,
    });

  } catch (err) {
    console.error(err);
    sock.sendMessage(chatId, {
      text: "😓 Meme gods are asleep. Try again in a bit!",
    });
  }
}

// 🔊 .tts command - text-to-speech
export async function tts(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const text = args.join(' ').trim();

  if (!text) {
    return sock.sendMessage(chatId, {
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
    sock.sendMessage(chatId, {
      text: "❌ Failed to generate speech. Try again later.",
    });
  }
}