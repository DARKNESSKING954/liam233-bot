// commands/media.js
import axios from 'axios';
import ytsr from 'ytsr';
import ytdl from 'ytdl-core';
import { exec } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import { stickerMetadata } from '../utils.js'; // helper for sticker metadata if needed

// --- Sticker command
export const sticker = async (sock, msg, args) => {
  const chatId = msg.key.remoteJid;

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const mediaMsg = quoted ? { message: quoted, ...msg } : msg;

  const hasMedia =
    mediaMsg.message.imageMessage ||
    mediaMsg.message.videoMessage ||
    (mediaMsg.message.documentMessage &&
      mediaMsg.message.documentMessage.mimetype === 'image/webp');

  if (!hasMedia) {
    return await sock.sendMessage(chatId, {
      text: '❌ Please reply to an image, video (≤10s), or sticker with `.sticker pack author`',
    });
  }

  if (args.length < 2) {
    return await sock.sendMessage(chatId, {
      text: '❌ Usage: `.sticker [packname] [author]`',
    });
  }

  const media = await sock.downloadMediaMessage(mediaMsg);
  const packname = args[0];
  const author = args.slice(1).join(' ');

  await sock.sendMessage(chatId, {
    sticker: media,
    stickerAuthor: author,
    stickerPackname: packname,
  });
};

// --- YouTube video downloader (.youtube)
export const youtube = async (sock, msg, args) => {
  const chatId = msg.key.remoteJid;
  if (!args.length) {
    return await sock.sendMessage(chatId, {
      text: '🔍 Usage: `.youtube [search keywords]`',
    });
  }

  const query = args.join(' ');
  const filters = await ytsr.getFilters(query);
  const videoFilter = filters.get('Type').get('Video');
  const search = await ytsr(videoFilter.url, { limit: 5 });
  const video = search.items.find((v) => v.type === 'video');

  if (!video) {
    return await sock.sendMessage(chatId, { text: `❌ No results found for "${query}".` });
  }

  // Ensure video is ≤ 30 min
  const [min, sec] = (video.duration || '0:00').split(':').map(Number);
  const totalSeconds = (min * 60) + sec;
  if (totalSeconds > 1800) {
    return await sock.sendMessage(chatId, {
      text: '⚠️ That video is longer than 30 minutes. Please choose a shorter one!',
    });
  }

  const info = await ytdl.getInfo(video.url);
  const format = ytdl.chooseFormat(info.formats, {
    quality: '18',
    filter: 'audioandvideo',
  });

  const filePath = path.join(process.cwd(), 'temp.mp4');
  const stream = ytdl(video.url, { format });

  const file = writeFileSync(filePath, Buffer.from([]));
  stream.pipe(file);

  stream.on('end', async () => {
    await sock.sendMessage(chatId, {
      video: { url: filePath },
      mimetype: 'video/mp4',
      caption: `🎬 ${video.title}`,
    });
    unlinkSync(filePath);
  });

  stream.on('error', async (err) => {
    await sock.sendMessage(chatId, { text: `❌ Error downloading: ${err.message}` });
  });
};

// --- .play (audio)
export const play = async (sock, msg, args) => {
  const chatId = msg.key.remoteJid;
  if (!args.length) {
    return await sock.sendMessage(chatId, {
      text: '🎧 Usage: `.play [song name]`',
    });
  }

  const query = args.join(' ');
  const filters = await ytsr.getFilters(query);
  const videoFilter = filters.get('Type').get('Video');
  const search = await ytsr(videoFilter.url, { limit: 5 });
  const video = search.items.find((v) => v.type === 'video');

  if (!video) {
    return await sock.sendMessage(chatId, { text: `❌ No results for "${query}".` });
  }

  const info = await ytdl.getInfo(video.url);
  const format = ytdl.filterFormats(info.formats, 'audioonly')[0];

  const filePath = path.join(process.cwd(), 'temp.mp3');
  const stream = ytdl(video.url, { format });

  const file = writeFileSync(filePath, Buffer.from([]));
  stream.pipe(file);

  stream.on('end', async () => {
    await sock.sendMessage(chatId, {
      audio: { url: filePath },
      mimetype: 'audio/mpeg',
      ptt: false,
    });
    unlinkSync(filePath);
  });

  stream.on('error', async (err) => {
    await sock.sendMessage(chatId, { text: `❌ Error playing: ${err.message}` });
  });
};

// --- .lyrics
export const lyrics = async (sock, msg, args) => {
  const chatId = msg.key.remoteJid;
  if (!args.length) {
    return await sock.sendMessage(chatId, {
      text: '🎶 Usage: `.lyrics [song name]`',
    });
  }

  const query = args.join(' ');

  try {
    const res = await axios.get(`https://some-random-api.ml/lyrics?title=${encodeURIComponent(query)}`);
    const lyrics = res.data?.lyrics;

    if (!lyrics) {
      return await sock.sendMessage(chatId, {
        text: `❌ No lyrics found for *${query}*.`,
      });
    }

    await sock.sendMessage(chatId, {
      text: `🎵 *${res.data.title}* by *${res.data.author}*\n\n${lyrics}`,
    });
  } catch (e) {
    await sock.sendMessage(chatId, {
      text: `❌ Error fetching lyrics: ${e.message}`,
    });
  }
};