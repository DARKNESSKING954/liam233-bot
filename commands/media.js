// commands/media.js
import axios from 'axios';
import ytsr from 'ytsr';
import ytdl from 'ytdl-core';

// Xeon-style fun error messages for long videos and lyrics not found
const ytLengthErrors = [
  "Whoa! That video is longer than my nap time 😴 Keep it under 30 minutes, please!",
  "Too long! I can't binge-watch that 🍿 Try something shorter!",
  "My circuits can't handle that length! Let's keep it short and sweet!",
];
const lyricsErrors = [
  "Oops! Couldn't find those lyrics. Maybe the song's top secret? 🤫",
  "Lyrics missing like my socks after laundry 🧦 Try another tune!",
  "No lyrics found! Did you try humming it yourself? 🎤",
];

// Helper to convert duration string (e.g., '12:34') to seconds
function durationToSeconds(duration) {
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 0;
}

// --- .sticker [packname] [stickername]
// Create sticker with pack and sticker name metadata
export async function sticker(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;

    // Must be an image or short video sent with command
    if (
      !msg.message.imageMessage &&
      !msg.message.videoMessage &&
      !msg.message.documentMessage
    ) {
      return sock.sendMessage(chatId, {
        text:
          "Send me an image or a short video with the `.sticker [packname] [name]` command to make a sticker!",
      });
    }

    if (args.length < 2) {
      return sock.sendMessage(chatId, {
        text:
          "Usage: `.sticker [packname] [sticker name]` — You gotta give both pack and sticker names!",
      });
    }

    const packname = args[0];
    const stickername = args.slice(1).join(' ');

    // Download media buffer
    const mediaMessage =
      msg.message.imageMessage || msg.message.videoMessage || msg.message.documentMessage;
    const mediaBuffer = await sock.downloadMediaMessage(msg);

    // Send sticker with metadata
    await sock.sendMessage(chatId, {
      sticker: mediaBuffer,
      contextInfo: {
        externalAdReply: {
          title: stickername,
          body: packname,
        },
      },
    });

    await sock.sendMessage(chatId, {
      text: `✨ Sticker created!\nPack: *${packname}*\nName: *${stickername}*`,
    });
  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `Sticker creation failed 😢 Error: ${e.message}`,
    });
  }
}

// --- .youtube [query]
// Search YouTube and download video (max 30 min)
export async function youtube(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;

    if (!args.length) {
      return sock.sendMessage(chatId, {
        text: 'Tell me what to search on YouTube! Usage: `.youtube [search terms]`',
      });
    }

    const query = args.join(' ');

    // Search YouTube videos
    const filters1 = await ytsr.getFilters(query);
    const filter1 = filters1.get('Type').get('Video');
    const searchResults = await ytsr(filter1.url, { limit: 5 });
    const video = searchResults.items.find((v) => v.type === 'video');

    if (!video) {
      return sock.sendMessage(chatId, {
        text: `Couldn't find a video matching "${query}". Try something else!`,
      });
    }

    // Check video duration ≤ 30 min
    const durationSeconds = durationToSeconds(video.duration || '0:00');

    if (durationSeconds > 1800) {
      const errMsg = ytLengthErrors[Math.floor(Math.random() * ytLengthErrors.length)];
      return sock.sendMessage(chatId, { text: errMsg });
    }

    // Download video as buffer via ytdl
    const info = await ytdl.getInfo(video.url);
    const format = ytdl.chooseFormat(info.formats, {
      quality: 'highestvideo',
      filter: (format) => format.hasVideo && format.hasAudio,
    });
    if (!format || !format.url) {
      return sock.sendMessage(chatId, {
        text: "Sorry, couldn't get a downloadable video format 😞",
      });
    }

    // Get video data as buffer
    const response = await axios.get(format.url, {
      responseType: 'arraybuffer',
    });
    const videoBuffer = Buffer.from(response.data);

    await sock.sendMessage(chatId, {
      video: videoBuffer,
      mimetype: 'video/mp4',
      caption: `🎬 *${video.title}*\n🔗 ${video.url}`,
    });
  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `Oops, YouTube download error: ${e.message}`,
    });
  }
}

// --- .play [song name]
// Search YouTube, download audio only, send as MP3
export async function play(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;

    if (!args.length) {
      return sock.sendMessage(chatId, {
        text: 'Tell me which song to play! Usage: `.play [song name]`',
      });
    }

    const query = args.join(' ');

    // Search YouTube videos
    const filters1 = await ytsr.getFilters(query);
    const filter1 = filters1.get('Type').get('Video');
    const searchResults = await ytsr(filter1.url, { limit: 5 });
    const video = searchResults.items.find((v) => v.type === 'video');

    if (!video) {
      return sock.sendMessage(chatId, {
        text: `Couldn't find "${query}". Try another song!`,
      });
    }

    // Download audio stream
    const info = await ytdl.getInfo(video.url);
    const audioFormat = ytdl.chooseFormat(info.formats, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });
    if (!audioFormat || !audioFormat.url) {
      return sock.sendMessage(chatId, {
        text: "Couldn't get audio stream 😢 Try again later.",
      });
    }

    const response = await axios.get(audioFormat.url, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(response.data);

    await sock.sendMessage(chatId, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: `${video.title}.mp3`,
      caption: `🎵 Here's your song: *${video.title}*`,
    });
  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `Play command error: ${e.message}`,
    });
  }
}

// --- .lyrics [song name]
// Search lyrics and send result with funny error messages
export async function lyrics(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;

    if (!args.length) {
      return sock.sendMessage(chatId, {
        text: 'Tell me which song lyrics you want! Usage: `.lyrics [song name]`',
      });
    }

    const query = args.join(' ');

    // Use lyrics.ovh API, but it expects artist and title separated
    // We try with only song name as artist/title fallback (may fail for some)
    // For better results, user can specify artist - songname (advanced)
    const encoded = encodeURIComponent(query);
    const url = `https://api.lyrics.ovh/v1/${encoded}/${encoded}`;

    let res;
    try {
      res = await axios.get(url, { timeout: 7000 });
    } catch {
      // fallback: try lyrics.ovh without artist/title (may not work)
      try {
        res = await axios.get(`https://api.lyrics.ovh/v1//${encoded}`, { timeout: 7000 });
      } catch {
        res = null;
      }
    }

    if (!res || !res.data || !res.data.lyrics) {
      const errMsg = lyricsErrors[Math.floor(Math.random() * lyricsErrors.length)];
      return sock.sendMessage(chatId, {
        text: `Couldn't find lyrics for "${query}". ${errMsg}`,
      });
    }

    let lyricsText = res.data.lyrics.trim();

    // Limit to 4000 chars for WhatsApp message
    if (lyricsText.length > 3900) {
      lyricsText = lyricsText.slice(0, 3900) + '\n\n[...lyrics truncated]';
    }

    await sock.sendMessage(chatId, {
      text: `🎤 Lyrics for *${query}*:\n\n${lyricsText}\n\n_Use .play ${query} to listen to it!_`,
    });
  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `Lyrics command error: ${e.message}`,
    });
  }
}