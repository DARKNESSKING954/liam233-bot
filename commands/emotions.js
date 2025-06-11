// commands/emotions.js
import fetch from 'node-fetch';

const TENOR_API_KEY = 'AIzaSyAym2Nnhn3O2FvwfFOrGVyY-LqCOZJyXsI';

async function getRandomGifUrl(emotion) {
  const res = await fetch(`https://tenor.googleapis.com/v2/search?q=${emotion}&key=${TENOR_API_KEY}&limit=10&media_filter=gif`);
  const json = await res.json();
  if (!json.results || !json.results.length) return null;
  const gifs = json.results.map(r => r.media_formats.gif.url);
  return gifs[Math.floor(Math.random() * gifs.length)];
}

async function sendReaction(sock, msg, emotion, emoji) {
  const from = msg.key.remoteJid;
  const ext = msg.message.extendedTextMessage;
  const mentioned = ext?.contextInfo?.mentionedJid?.[0];
  if (!mentioned) {
    return sock.sendMessage(from, { text: `Please tag someone to ${emotion}. Example: .${emotion} @user` });
  }
  const gifUrl = await getRandomGifUrl(emotion);
  if (!gifUrl) {
    return sock.sendMessage(from, { text: `Couldn't find a ${emotion} GIF.` });
  }

  const me = msg.pushName || 'Someone';
  const tag = `@${mentioned.split('@')[0]}`;
  const caption = `${emoji} ${me} sends ${emotion} to ${tag}`;

  await sock.sendMessage(from, {
    video: { url: gifUrl },
    caption,
    gifPlayback: true,
    mentions: [mentioned]
  });
}

export async function kiss(sock, msg) { await sendReaction(sock, msg, 'kiss', '😘'); }
export async function slap(sock, msg) { await sendReaction(sock, msg, 'slap', '👋'); }
export async function hug(sock, msg) { await sendReaction(sock, msg, 'hug', '🤗'); }
export async function poke(sock, msg) { await sendReaction(sock, msg, 'poke', '☝️'); }
export async function cuddle(sock, msg) { await sendReaction(sock, msg, 'cuddle', '🧸'); }
export async function pat(sock, msg) { await sendReaction(sock, msg, 'pat', '👏'); }
export async function bite(sock, msg) { await sendReaction(sock, msg, 'bite', '🦷'); }
export async function dance(sock, msg) { await sendReaction(sock, msg, 'dance', '💃'); }
export async function cry(sock, msg) { await sendReaction(sock, msg, 'cry', '😭'); }
export async function laugh(sock, msg) { await sendReaction(sock, msg, 'laugh', '😂'); }
export async function wave(sock, msg) { await sendReaction(sock, msg, 'wave', '👋'); }
export async function smile(sock, msg) { await sendReaction(sock, msg, 'smile', '😊'); }
export async function angry(sock, msg) { await sendReaction(sock, msg, 'angry', '😡'); }
export async function blush(sock, msg) { await sendReaction(sock, msg, 'blush', '😊'); }
export async function highfive(sock, msg) { await sendReaction(sock, msg, 'high five', '🖐️'); }
