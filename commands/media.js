import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { tmpdir } from 'os';
import { fileTypeFromBuffer } from 'file-type';

// Helper: Save to temporary file
function getTempFilePath(ext = '') {
  const tempFile = path.join(tmpdir(), `temp_${Date.now()}${ext}`);
  return tempFile;
}

// Sticker Command — `.sticker`
export async function sticker(sock, msg) {
  try {
    const chatId = msg.key.remoteJid;
    const media = await sock.downloadMediaMessage(msg);

    if (!media) {
      return sock.sendMessage(chatId, {
        text: "❌ Send me an image, short video, or sticker to convert into a sticker!",
      });
    }

    await sock.sendMessage(chatId, {
      sticker: media,
      packname: 'Liambot',
      author: 'Funny Stickers',
    });
  } catch (err) {
    console.error(err);
    return sock.sendMessage(msg.key.remoteJid, {
      text: "⚠️ Failed to create sticker!",
    });
  }
}

// YouTube Video Downloader — `.youtube [query]`
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
      return sock.sendMessage(chatId, { text: "❌ Couldn't find a video!" });
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

// Play Music from YouTube — `.play [song name]`
export async function play(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const query = args.join(' ');

  if (!query) {
    return sock.sendMessage(chatId, {
      text: "🎵 Usage: `.play [song name]` — I’ll send you the song as audio!",
    });
  }

  try {
    const searchRes = await axios.get(`https://ytapi.llama.sh/search?q=${encodeURIComponent(query)}`);
    const video = searchRes.data?.videos?.[0];

    if (!video || !video.url) {
      return sock.sendMessage(chatId, { text: "❌ Couldn't find that song!" });
    }

    const outPath = getTempFilePath('.mp3');
    const cmd = `yt-dlp -x --audio-format mp3 -o "${outPath}" "${video.url}"`;

    exec(cmd, async (err) => {
      if (err) {
        console.error(err);
        return sock.sendMessage(chatId, { text: "❌ Failed to download audio with yt-dlp." });
      }

      const buffer = fs.readFileSync(outPath);
      await sock.sendMessage(chatId, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: `${video.title}.mp3`,
        caption: `🎧 *${video.title}*`,
      });

      fs.unlinkSync(outPath);
    });
  } catch (e) {
    console.error(e);
    return sock.sendMessage(chatId, { text: `❌ Play error: ${e.message}` });
  }
}

// Lyrics Command — `.lyrics [song name]`
export async function lyrics(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const query = args.join(' ');

  if (!query) {
    return sock.sendMessage(chatId, {
      text: "📄 Usage: `.lyrics [song name]` — I’ll try to find the lyrics!",
    });
  }

  try {
    const res = await axios.get(`https://some-random-api.ml/lyrics?title=${encodeURIComponent(query)}`);
    const data = res.data;

    if (!data || !data.lyrics) {
      return sock.sendMessage(chatId, {
        text: `❌ No lyrics found for "${query}". Try another song!`,
      });
    }

    let lyrics = data.lyrics.trim();
    if (lyrics.length > 3900) {
      lyrics = lyrics.slice(0, 3900) + '\n\n[...lyrics truncated]';
    }

    return sock.sendMessage(chatId, {
      text: `🎤 *Lyrics for ${data.title || query}*:\n\n${lyrics}`,
    });
  } catch (e) {
    return sock.sendMessage(chatId, {
      text: `❌ Couldn't fetch lyrics for "${query}".`,
    });
  }
}