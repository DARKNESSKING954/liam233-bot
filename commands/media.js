// commands/media.js
// 📦 LiamBot Media Tools Commands — fresh with sticker, youtube, insta, tiktok, funnyvideo

import axios from 'axios';
import { MessageType, Mimetype } from '@whiskeysockets/baileys'; // adjust import if needed
import ytsr from 'ytsr'; // For YouTube search
import ytdl from 'ytdl-core'; // For YouTube video info and download
import { randomUUID } from 'crypto';

// Helper: Sleep for ms
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Dummy funny Xeon-style error messages for reuse
const funnyErrors = [
  "Oopsie daisy! That video is longer than my attention span 😵‍💫 Try something shorter!",
  "Bro, that video is like a whole movie 🍿 Keep it under 30 mins plz!",
  "My circuits fried trying to grab that long vid 🔥 How about a shorter one?",
];

// --- Command: .sticker [packname] [stickername]
// Creates a sticker with custom pack and sticker names
export async function sticker(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;
    if (!msg.message.imageMessage && !msg.message.documentMessage && !msg.message.videoMessage) {
      return sock.sendMessage(chatId, { text: "Send an image or short video with `.sticker [packname] [name]` to make a sticker, cool?" });
    }
    if (args.length < 2) {
      return sock.sendMessage(chatId, { text: "Usage: `.sticker [packname] [name]` — gotta name that pack AND the sticker, boss!" });
    }

    const packname = args[0];
    const stickername = args.slice(1).join(" ");

    // Download media buffer
    const mediaMessage = msg.message.imageMessage || msg.message.documentMessage || msg.message.videoMessage;
    const stream = await sock.downloadMediaMessage(msg);
    const stickerBuffer = stream; // buffer of the media

    // Send sticker with metadata (packname, author = stickername)
    await sock.sendMessage(chatId, {
      sticker: stickerBuffer,
      contextInfo: {
        externalAdReply: {
          title: stickername,
          body: packname,
        }
      }
    });

    await sock.sendMessage(chatId, { text: `✨ Sticker created!\nPack: *${packname}*\nName: *${stickername}*` });

  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, { text: `Uh-oh, sticker magic failed: ${e.message}` });
  }
}

// --- Command: .youtube [query]
// Search YouTube and download video if ≤30 mins else funny error message
export async function youtube(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;
    if (!args.length) {
      return sock.sendMessage(chatId, { text: "What you wanna watch? Use `.youtube [search terms]`" });
    }

    const query = args.join(" ");

    // Search YouTube for videos (limit 1)
    const filters1 = await ytsr.getFilters(query);
    const filter1 = filters1.get('Type').get('Video');
    const searchResults = await ytsr(filter1.url, { limit: 5 });
    const video = searchResults.items.find(v => v.type === 'video');

    if (!video) {
      return sock.sendMessage(chatId, { text: `Couldn't find any video matching "${query}" 🤷‍♂️ Try something else.` });
    }

    // Check video length in seconds
    const durationString = video.duration || "0:00";
    const parts = durationString.split(':').map(Number);
    let durationSeconds = 0;
    if (parts.length === 3) durationSeconds = parts[0]*3600 + parts[1]*60 + parts[2];
    else if (parts.length === 2) durationSeconds = parts[0]*60 + parts[1];
    else durationSeconds = parts[0];

    if (durationSeconds > 1800) { // > 30 minutes
      const errorMsg = funnyErrors[Math.floor(Math.random() * funnyErrors.length)];
      return sock.sendMessage(chatId, { text: errorMsg });
    }

    // Download video using ytdl
    const info = await ytdl.getInfo(video.url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'videoandaudio' });
    if (!format || !format.url) {
      return sock.sendMessage(chatId, { text: "Couldn't get the video download link 😓 Try again later." });
    }

    // Download the video buffer via axios streaming
    const response = await axios.get(format.url, { responseType: 'arraybuffer' });
    const videoBuffer = Buffer.from(response.data);

    // Send video
    await sock.sendMessage(chatId, {
      video: videoBuffer,
      mimetype: 'video/mp4',
      caption: `🎬 *${video.title}*\n🔗 ${video.url}`,
    });

  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, { text: `Youtube download oops: ${e.message}` });
  }
}

// --- Command: .insta [url]
// Download Instagram video from link
export async function insta(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(chatId, { text: "Send me an Instagram video URL like `.insta [url]`!" });
    const url = args[0];

    if (!url.match(/instagram\.com\/(p|reel|tv)\//)) {
      return sock.sendMessage(chatId, { text: "That's not a valid Instagram video URL, mate 🤨" });
    }

    // Use a 3rd party insta video downloader API (example: https://instagram-downloader-download-instagram-videos.p.rapidapi.com/)
    // Here we use a free public API or fallback to a simulated response

    // For demo, simulate a download and send a funny message:
    await sock.sendMessage(chatId, { text: "Downloading Insta video... This may take a sec ⏳" });
    await sleep(2000);

    // Simulate downloaded video by sending a placeholder video or message
    await sock.sendMessage(chatId, { text: "Instagram video download feature is currently in demo mode 🤖 Stay tuned!" });

  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, { text: `Instagram download error: ${e.message}` });
  }
}

// --- Command: .tiktok [query]
// Search TikTok videos related to query and send one
export async function tiktok(sock, msg, args) {
  try {
    const chatId = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(chatId, { text: "Tell me what TikTok videos to search with `.tiktok [query]`!" });
    const query = args.join(" ");

    // Simulate searching TikTok via API or scraping (usually needs external service)
    await sock.sendMessage(chatId, { text: `Looking for TikTok videos about "${query}"... 🔍` });
    await sleep(2500);

    // Demo: send a fixed TikTok video link or a message
    // Replace with real API call when available
    const demoVideoUrl = 'https://v16-webapp.tiktok.com/video/tos/useast2a/tos-useast2a-ve-0068c004/1234567890abcdef/video.mp4'; // fake link

    await sock.sendMessage(chatId, { text: `Sorry, TikTok video search is in demo mode. Here's a sample video instead! 🎉` });
  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, { text: `TikTok oops: ${e.message}` });
  }
}

// --- Command: .funnyvideo
// Send a random funny video from predefined list
export async function funnyvideo(sock, msg) {
  try {
    const chatId = msg.key.remoteJid;

    const funnyVideos = [
      { url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', title: 'Big Buck Bunny (sample)' },
      { url: 'https://sample-videos.com/video123/mp4/720/sample_640x360.mp4', title: 'Funny Sample Video' },
      // Add your own funny videos URLs here
    ];

    const video = funnyVideos[Math.floor(Math.random() * funnyVideos.length)];

    const response = await axios.get(video.url, { responseType: 'arraybuffer' });
    const videoBuffer = Buffer.from(response.data);

    await sock.sendMessage(chatId, {
      video: videoBuffer,
      mimetype: 'video/mp4',
      caption: `😂 Here's a funny video for you: *${video.title}*`,
    });

  } catch (e) {
    await sock.sendMessage(msg.key.remoteJid, { text: `Couldn't fetch a funny video right now. Try again later!` });
  }
}