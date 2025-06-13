// commands/media.js
// 📦 LiamBot Media Tools Commands — sticker, youtube, play, lyrics with Xeon-style fun messages

import axios from 'axios';
import ytsr from 'ytsr';
import ytdl from 'ytdl-core';

// Helper: Sleep for ms
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fun Xeon-style error messages for YouTube video length
const ytLengthErrors = [
  "Whoa there! That video is longer than my battery life 🔋 Keep it under 30 minutes, please!",
  "My circuits just smoked trying to load that lengthy vid! Try a shorter one 😵‍💫",
  "No can do, that vid's a feature film 🍿 Let's stick to shorter clips!",
];

// Fun Xeon-style lyrics errors
const lyricsErrors = [
  "Hmm, couldn't find those lyrics. Maybe they're in another dimension? 🌌",
  "Lyrics missing like my socks after laundry 🧦 Try another song!",
  "No lyrics found! Did you try singing it yourself? 🎤",
];

// --- Command: .sticker [packname] [stickername]
// Create sticker with custom pack and sticker names
export async function sticker(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;
    if (!msg.message.imageMessage && !msg.message.documentMessage && !msg.message.videoMessage) {
      return sock.sendMessage(chatId, { text: "Send me an image or short video along with `.sticker [packname] [name]` to make a cool sticker!" });
    }
    if (args.length < 2) {
      return sock.sendMessage(chatId, { text: "Usage: `.sticker [packname] [name]` — gotta name your sticker pack AND sticker, my friend!" });
    }

    const packname = args[0];
    const stickername = args.slice(1).join(" ");

    // Download media buffer
    const mediaMessage = msg.message.imageMessage || msg.message.documentMessage || msg.message.videoMessage;
    const mediaBuffer = await sock.downloadMediaMessage(msg);

    // Send sticker with metadata (packname, author = stickername)
    await sock.sendMessage(chatId, {
      sticker: mediaBuffer,
      contextInfo: {
        externalAdReply: {
          title: stickername,
          body: packname,
        }
      }
    });

    await sock.sendMessage(chatId, { text: `✨ Sticker created!\nPack: *${packname}*\nName: *${stickername}*` });

  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, { text: `Sticker creation failed 😢 Error: ${e.message}` });
  }
}

// --- Command: .youtube [query]
// Search YouTube and download video ≤30 minutes or show funny error
export async function youtube(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;
    if (!args.length) {
      return sock.sendMessage(chatId, { text: "Gimme something to search on YouTube! Usage: `.youtube [search terms]`" });
    }

    const query = args.join(" ");

    // Search YouTube videos
    const filters1 = await ytsr.getFilters(query);
    const filter1 = filters1.get('Type').get('Video');
    const searchResults = await ytsr(filter1.url, { limit: 5 });
    const video = searchResults.items.find(v => v.type === 'video');

    if (!video) {
      return sock.sendMessage(chatId, { text: `Couldn't find a video matching "${query}". Try another search!` });
    }

    // Parse duration string to seconds
    const dur = video.duration || "0:00";
    const parts = dur.split(':').map(Number);
    let durationSeconds = 0;
    if (parts.length === 3) durationSeconds = parts[0]*3600 + parts[1]*60 + parts[2];
    else if (parts.length === 2) durationSeconds = parts[0]*60 + parts[1];
    else durationSeconds = parts[0];

    if (durationSeconds > 1800) {
      // Funny error if video too long
      const errorMsg = ytLengthErrors[Math.floor(Math.random() * ytLengthErrors.length)];
      return sock.sendMessage(chatId, { text: errorMsg });
    }

    // Download video buffer using ytdl
    const info = await ytdl.getInfo(video.url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'videoandaudio' });
    if (!format || !format.url) {
      return sock.sendMessage(chatId, { text: "Oops! Couldn't fetch the video download link." });
    }

    const videoResponse = await axios.get(format.url, { responseType: 'arraybuffer' });
    const videoBuffer = Buffer.from(videoResponse.data);

    await sock.sendMessage(chatId, {
      video: videoBuffer,
      mimetype: 'video/mp4',
      caption: `🎬 *${video.title}*\n🔗 ${video.url}`,
    });

  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, { text: `YouTube command error: ${e.message}` });
  }
}

// --- Command: .play [song name]
// Search YouTube, download audio, send as MP3
export async function play(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;
    if (!args.length) {
      return sock.sendMessage(chatId, { text: "Tell me what song to play! Usage: `.play [song name]`" });
    }

    const query = args.join(" ");

    // Search YouTube videos
    const filters1 = await ytsr.getFilters(query);
    const filter1 = filters1.get('Type').get('Video');
    const searchResults = await ytsr(filter1.url, { limit: 5 });
    const video = searchResults.items.find(v => v.type === 'video');

    if (!video) {
      return sock.sendMessage(chatId, { text: `Couldn't find the song "${query}". Try another one!` });
    }

    // Download audio stream via ytdl
    const info = await ytdl.getInfo(video.url);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
    if (!audioFormat || !audioFormat.url) {
      return sock.sendMessage(chatId, { text: "Couldn't get audio stream 😓 Try again later." });
    }

    const audioResponse = await axios.get(audioFormat.url, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(audioResponse.data);

    await sock.sendMessage(chatId, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: `${video.title}.mp3`,
      caption: `🎵 Here's your song: *${video.title}*`,
    });

  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, { text: `Play command error: ${e.message}` });
  }
}

// --- Command: .lyrics [song name]
// Search and send lyrics with fun explanation
export async function lyrics(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;
    if (!args.length) {
      return sock.sendMessage(chatId, { text: "Which song lyrics you want? Usage: `.lyrics [song name]`" });
    }

    const query = args.join(" ");

    // Use some free lyrics API, e.g. lyrics.ovh or any other open API
    // For demo, using lyrics.ovh
    const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(query)}`, { timeout: 7000 })
      .catch(() => null);

    if (!response || !response.data || !response.data.lyrics) {
      // Random funny error message
      const errMsg = lyricsErrors[Math.floor(Math.random() * lyricsErrors.length)];
      return sock.sendMessage(chatId, { text: `Couldn't find lyrics for "${query}". ${errMsg}` });
    }

    const lyricsText = response.data.lyrics.trim();

    // Limit lyrics length to 4000 chars for WhatsApp
    const trimmedLyrics = lyricsText.length > 3900 ? lyricsText.slice(0, 3900) + "\n\n[...lyrics truncated]" : lyricsText;

    await sock.sendMessage(chatId, {
      text: `🎤 Lyrics for *${query}*:\n\n${trimmedLyrics}\n\n_Use .play ${query} to listen to it!_`,
    });

  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, { text: `Lyrics command oops: ${e.message}` });
  }
}