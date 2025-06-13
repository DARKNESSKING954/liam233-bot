import axios from 'axios';
import ytsr from 'ytsr';
import ytdl from 'ytdl-core';
import { Sticker } from 'wa-sticker-formatter';
import { execSync } from 'child_process';

// --- Sticker command (.sticker [pack] [name])
export async function sticker(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;
    const mediaMsg = msg.message;

    const hasMedia =
      mediaMsg?.imageMessage ||
      mediaMsg?.videoMessage ||
      (mediaMsg?.documentMessage?.mimetype === 'image/webp');

    if (!hasMedia) {
      return sock.sendMessage(chatId, {
        text: "❗ Send an image/video/sticker with `.sticker [pack] [name]` to create a custom sticker!",
      });
    }

    if (args.length < 2) {
      return sock.sendMessage(chatId, {
        text: "❗ Usage: `.sticker [packname] [name]`",
      });
    }

    const pack = args[0];
    const name = args.slice(1).join(' ');
    const media = await sock.downloadMediaMessage(msg);

    const sticker = new Sticker(media, {
      pack: pack,
      author: name,
      type: Sticker.Types.FULL,
    });

    await sock.sendMessage(chatId, await sticker.toMessage());
  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ Sticker error: ${e.message}`,
    });
  }
}

// --- YouTube video downloader (.youtube [query])
export async function youtube(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;

    if (!args.length) {
      return sock.sendMessage(chatId, {
        text: "❗ Usage: `.youtube [search query]`",
      });
    }

    const query = args.join(' ');
    const filters = await ytsr.getFilters(query);
    const videoFilter = filters.get('Type').get('Video');
    const searchResults = await ytsr(videoFilter.url, { limit: 5 });
    const video = searchResults.items.find((v) => v.type === 'video');

    if (!video) {
      return sock.sendMessage(chatId, { text: "⚠️ No results found!" });
    }

    // Reject videos longer than 30 minutes
    const durationSecs = durationToSeconds(video.duration);
    if (durationSecs > 1800) {
      return sock.sendMessage(chatId, {
        text: `⏳ Video too long (${video.duration}). Keep it under 30 minutes!`,
      });
    }

    const info = await ytdl.getInfo(video.url);
    const format = ytdl.chooseFormat(info.formats, {
      quality: '18', // 360p mp4
    });

    const response = await axios.get(format.url, {
      responseType: 'arraybuffer',
    });

    await sock.sendMessage(chatId, {
      video: Buffer.from(response.data),
      mimetype: 'video/mp4',
      caption: `🎬 *${video.title}*\n🔗 ${video.url}`,
    });
  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ YouTube error: ${e.message}`,
    });
  }
}

// --- Play audio from YouTube (.play [query])
export async function play(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;

    if (!args.length) {
      return sock.sendMessage(chatId, {
        text: "❗ Usage: `.play [song name]`",
      });
    }

    const query = args.join(' ');
    const filters = await ytsr.getFilters(query);
    const videoFilter = filters.get('Type').get('Video');
    const searchResults = await ytsr(videoFilter.url, { limit: 5 });
    const video = searchResults.items.find((v) => v.type === 'video');

    if (!video) {
      return sock.sendMessage(chatId, { text: "⚠️ No results found!" });
    }

    const info = await ytdl.getInfo(video.url);
    const audioFormat = ytdl.chooseFormat(info.formats, {
      quality: 'highestaudio',
    });

    const audio = await axios.get(audioFormat.url, {
      responseType: 'arraybuffer',
    });

    await sock.sendMessage(chatId, {
      audio: Buffer.from(audio.data),
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`,
      caption: `🎶 *${video.title}*`,
    });
  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ Play error: ${e.message}`,
    });
  }
}

// --- Lyrics command (.lyrics [song])
export async function lyrics(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;

    if (!args.length) {
      return sock.sendMessage(chatId, {
        text: "❗ Usage: `.lyrics [song name]`",
      });
    }

    const query = args.join(' ');
    const encoded = encodeURIComponent(query);
    let lyricsText = null;

    try {
      const res = await axios.get(`https://some-random-api.ml/lyrics?title=${encoded}`);
      if (res.data && res.data.lyrics) {
        lyricsText = res.data.lyrics;
      }
    } catch {}

    if (!lyricsText) {
      return sock.sendMessage(chatId, {
        text: `😢 No lyrics found for *${query}*. Try another song.`,
      });
    }

    if (lyricsText.length > 3900) {
      lyricsText = lyricsText.slice(0, 3900) + "\n\n[...truncated]";
    }

    await sock.sendMessage(chatId, {
      text: `🎤 *Lyrics for ${query}*:\n\n${lyricsText}`,
    });
  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ Lyrics error: ${e.message}`,
    });
  }
}

// Helper to convert duration strings like "4:56" into seconds
function durationToSeconds(str) {
  if (!str) return 0;
  const parts = str.split(':').map(Number);
  return parts.reduce((acc, val, i) => acc + val * Math.pow(60, parts.length - 1 - i), 0);
}