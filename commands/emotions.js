// commands/emotions.js
// 💞 LiamBot Emotions - GIF Reactions with Download & Cleanup

import axios from 'axios';
import { writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

const TENOR_API_KEY = 'AIzaSyAym2Nnhn3O2FvwfFOrGVyY-LqCOZJyXsI'; // Public key from Tenor

const emotions = [
  'kiss', 'slap', 'hug', 'poke', 'cuddle',
  'pat', 'bite', 'dance', 'cry', 'laugh',
  'wave', 'smile', 'angry', 'blush', 'highfive'
];

// 🔁 Function to fetch a random GIF from Tenor
async function getEmotionGif(emotion) {
  const url = `https://tenor.googleapis.com/v2/search?q=anime+${emotion}&key=${TENOR_API_KEY}&limit=10&media_filter=gif`;
  const res = await axios.get(url);
  const gifs = res.data.results;
  if (!gifs.length) throw new Error('No gifs found');
  const random = gifs[Math.floor(Math.random() * gifs.length)];
  return random.media_formats.gif.url;
}

// ⬇️ Download GIF and save to temp file
async function downloadGif(gifUrl) {
  const filePath = path.join(tmpdir(), `${uuidv4()}.mp4`);
  const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
  writeFileSync(filePath, response.data);
  return filePath;
}

// 🧠 Create and export all emotion commands
const emotionCommands = {};

for (const emotion of emotions) {
  emotionCommands[emotion] = async (sock, msg, args) => {
    const mention =
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      msg.key.participant ||
      msg.key.remoteJid;

    try {
      const gifUrl = await getEmotionGif(emotion);
      const filePath = await downloadGif(gifUrl);

      await sock.sendMessage(msg.key.remoteJid, {
        video: { url: filePath },
        gifPlayback: true,
        caption: `*${emotion.toUpperCase()}!* 💥`,
        mentions: [mention]
      });

      unlinkSync(filePath); // ✅ Delete file after sending
    } catch (err) {
      console.error(`❌ Error sending ${emotion}:`, err.message);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Failed to send *${emotion}* gif.`
      });
    }
  };
}

export default emotionCommands;
