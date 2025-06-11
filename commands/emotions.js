// 📦 LiamBot Emotional Reactions (Animated GIF-style MP4s via Tenor)
import fetch from 'node-fetch';
const TENOR_API_KEY = 'YOUR_TENOR_API_KEY'; // Replace with your actual Tenor API key

async function getRandomGifUrl(emotion) {
  const res = await fetch(`https://tenor.googleapis.com/v2/search?q=${emotion}&key=${TENOR_API_KEY}&limit=10&media_filter=gif`);
  const json = await res.json();
  if (!json.results || !json.results.length) return null;
  const gifs = json.results.map(r => r.media_formats.tinygif.url);
  return gifs[Math.floor(Math.random() * gifs.length)];
}

async function sendEmotion(sock, msg, emotion, emoji) {
  const from = msg.key.remoteJid;
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mentioned) {
    await sock.sendMessage(from, { text: `❌ Please mention someone to ${emotion}.` });
    return;
  }

  const sender = msg.pushName || 'Someone';
  const receiverTag = `@${mentioned.split('@')[0]}`;
  const caption = `${emoji} *${sender}* ${emotion}s ${receiverTag}`;

  const gifUrl = await getRandomGifUrl(emotion);
  if (!gifUrl) {
    await sock.sendMessage(from, { text: `❌ Could not fetch a ${emotion} gif.` });
    return;
  }

  await sock.sendMessage(from, {
    video: { url: gifUrl },
    gifPlayback: true,
    caption,
    mentions: [mentioned]
  });
}

export default {
  kiss: (sock, msg) => sendEmotion(sock, msg, 'kiss', '💋'),
  slap: (sock, msg) => sendEmotion(sock, msg, 'slap', '🖐️'),
  hug: (sock, msg) => sendEmotion(sock, msg, 'hug', '🤗'),
  poke: (sock, msg) => sendEmotion(sock, msg, 'poke', '👉'),
  cuddle: (sock, msg) => sendEmotion(sock, msg, 'cuddle', '🧸'),
  pat: (sock, msg) => sendEmotion(sock, msg, 'pat', '👋'),
  bite: (sock, msg) => sendEmotion(sock, msg, 'bite', '🧛'),
  dance: (sock, msg) => sendEmotion(sock, msg, 'dance', '💃'),
  cry: (sock, msg) => sendEmotion(sock, msg, 'cry', '😭'),
  laugh: (sock, msg) => sendEmotion(sock, msg, 'laugh', '😂'),
  wave: (sock, msg) => sendEmotion(sock, msg, 'wave', '👋'),
  smile: (sock, msg) => sendEmotion(sock, msg, 'smile', '😊'),
  angry: (sock, msg) => sendEmotion(sock, msg, 'angry', '😡'),
  blush: (sock, msg) => sendEmotion(sock, msg, 'blush', '😊'),
  highfive: (sock, msg) => sendEmotion(sock, msg, 'highfive', '✋'),
};