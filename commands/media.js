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

    // Get quoted message for media
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) {
      return sock.sendMessage(chatId, {
        text: "🖼️ *Sticker Maker*\nReply to an image or short video with *.sticker* and I'll turn it into a sticker!",
      });
    }

    // Download media buffer
    const mediaBuffer = await sock.downloadMediaMessage({ message: quoted });
    if (!mediaBuffer) {
      return sock.sendMessage(chatId, {
        text: "⚠️ Couldn't download media. Please try again with a proper image or video.",
      });
    }

    // Check media type (image or video)
    const type = await fileType.fromBuffer(mediaBuffer);
    if (!type || !['image', 'video'].some(t => type.mime.startsWith(t))) {
      return sock.sendMessage(chatId, {
        text: "⚠️ Please reply to an image or short video to make a sticker.",
      });
    }

    // Send sticker with packname and author metadata
    await sock.sendMessage(chatId, {
      sticker: mediaBuffer,
      packname: 'Liambot',
      author: 'Funny Stickers',
    });
  } catch (err) {
    console.error(err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "😢 Oops! Couldn't create sticker. Try again later.",
    });
  }
}

// 📽️ .youtube command - download YouTube video under 30 minutes
export async function youtube(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const url = args.join(' ').trim();

  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    return sock.sendMessage(chatId, {
      text:
        "📽️ *YouTube Downloader*\nUse `.youtube [YouTube URL]` to download a video under 30 minutes.\n_Example:_ `.youtube https://youtu.be/abc123`",
    });
  }

  try {
    const outPath = getTempFilePath('.mp4');
    const cmd = `yt-dlp -f "best[ext=mp4][duration<=1800]" --max-filesize 200M -o "${outPath}" "${url}"`;

    await sock.sendMessage(chatId, { text: "⏳ Downloading your YouTube video, please wait..." });

    exec(cmd, async (err) => {
      if (err || !fs.existsSync(outPath)) {
        console.error(err);
        return sock.sendMessage(chatId, {
          text: "❌ Failed to download. Make sure the video is valid, under 30 minutes, and under 200MB.",
        });
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
    return sock.sendMessage(chatId, { text: `🚫 Error downloading video: ${e.message}` });
  }
}

// 🎵 .play command - download YouTube audio as mp3 and send as audio file
export async function play(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const query = args.join(' ').trim();

  if (!query) {
    return sock.sendMessage(chatId, {
      text: "🎵 *Play Command*\nUse `.play [song name or YouTube URL]` to download the audio and get an MP3.",
    });
  }

  try {
    // Output mp3 file path
    const outPath = getTempFilePath('.mp3');

    // If query is URL, use directly; else search YouTube for first result
    const isUrl = query.includes('youtube.com') || query.includes('youtu.be');

    // yt-dlp command:
    // If search, use "ytsearch1:" prefix to get first match
    const ytQuery = isUrl ? query : `ytsearch1:${query}`;

    const cmd = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outPath}" "${ytQuery}"`;

    await sock.sendMessage(chatId, { text: "🎧 Searching and downloading audio, please wait..." });

    exec(cmd, async (err) => {
      if (err || !fs.existsSync(outPath)) {
        console.error(err);
        return sock.sendMessage(chatId, {
          text: "❌ Couldn't download the audio. Try a different song or link.",
        });
      }

      const buffer = fs.readFileSync(outPath);
      await sock.sendMessage(chatId, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: 'song.mp3',
        caption: `🎶 Here's your song: ${query}`,
      });

      fs.unlinkSync(outPath);
    });
  } catch (e) {
    console.error(e);
    return sock.sendMessage(chatId, { text: `🚫 Error downloading audio: ${e.message}` });
  }
}

// 🐸 .meme command
export async function meme(sock, msg) {
  const chatId = msg.key.remoteJid;

  try {
    // Call meme-api and get JSON
    const { data: meme } = await axios.get('https://meme-api.com/gimme');

    if (!meme || !meme.url || !meme.title) {
      return sock.sendMessage(chatId, {
        text: "⚠️ Couldn't fetch a proper meme right now. Try again later!",
      });
    }

    await sock.sendMessage(chatId, {
      image: { url: meme.url },
      caption: `🤣 *${meme.title}*\n👍 ${meme.ups} | 🧵 r/${meme.subreddit}`,
    });
  } catch (err) {
    console.error(err);
    await sock.sendMessage(chatId, {
      text: "😓 Meme gods are sleeping. Try again later!",
    });
  }
}