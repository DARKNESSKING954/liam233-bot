// commands/emotions.js
import axios from 'axios';
import { writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

const TENOR_API_KEY = 'LIVDSRZULELA';
const emotions = [
  'kiss', 'slap', 'hug', 'poke', 'cuddle',
  'pat', 'bite', 'dance', 'cry', 'laugh',
  'wave', 'smile', 'angry', 'blush', 'highfive'
];

// ✨ Fetch MP4 URL (not static gif)
async function getEmotionGif(emotion) {
  const res = await axios.get(
    `https://tenor.googleapis.com/v2/search`,
    {
      params: {
        q: `anime ${emotion}`,
        key: TENOR_API_KEY,
        limit: 10,
        media_filter: 'minimal' // yields gif, mp4, tinygif
      }
    }
  );
  const results = res.data.results;
  if (!results.length) throw new Error('No gifs found');

  // Prefer MP4 (media_formats.mp4), fallback to tinymp4
  const media = results[Math.floor(Math.random() * results.length)].media_formats;
  return media.mp4?.url || media.tinymp4?.url;
}

// ⬇️ Download MP4 to temp and return path
async function downloadGif(gifUrl) {
  const filePath = path.join(tmpdir(), `${uuidv4()}.mp4`);
  const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
  writeFileSync(filePath, Buffer.from(response.data));
  return filePath;
}

// Construct and export commands
const emotionCommands = {};

for (const emotion of emotions) {
  emotionCommands[emotion] = async (sock, msg, args) => {
    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const targetJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!targetJid) throw new Error('No mention');

      const senderTag = `@${senderJid.split('@')[0]}`;
      const targetTag = `@${targetJid.split('@')[0]}`;
      const caption = `${senderTag} *${emotion}s* ${targetTag}`;

      const gifUrl = await getEmotionGif(emotion);
      const filePath = await downloadGif(gifUrl);

      await sock.sendMessage(msg.key.remoteJid, {
        video: { url: filePath },
        gifPlayback: true,
        caption,
        mentions: [senderJid, targetJid]
      });

      unlinkSync(filePath); // Cleanup
    } catch (err) {
      console.error(`❌ Error sending ${emotion}:`, err.message);
      const text = err.message === 'No mention'
        ? `❗ You need to mention someone to ${emotion}. Example: .${emotion} @user`
        : `❌ Could not fetch a ${emotion} gif right now.`;
      await sock.sendMessage(msg.key.remoteJid, { text });
    }
  }
}

export default emotionCommands;