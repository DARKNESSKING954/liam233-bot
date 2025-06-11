// commands/emotions.js
import axios from 'axios';
import { writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

const TENOR_API_KEY = 'LIVDSRZULELA'; // Public key
const emotions = [
  'kiss', 'slap', 'hug', 'poke', 'cuddle',
  'pat', 'bite', 'dance', 'cry', 'laugh',
  'wave', 'smile', 'angry', 'blush', 'highfive'
];

// Get MP4 URL (animated version)
async function getEmotionGif(emotion) {
  const url = `https://tenor.googleapis.com/v2/search?q=anime+${emotion}&key=${TENOR_API_KEY}&limit=10&media_filter=gif`;
  const res = await axios.get(url);
  const gifs = res.data.results;
  if (!gifs.length) throw new Error('No gifs found');
  return gifs[Math.floor(Math.random() * gifs.length)].media_formats.mp4.url;
}

// Download MP4 to temp folder
async function downloadGif(gifUrl) {
  const filePath = path.join(tmpdir(), `${uuidv4()}.mp4`);
  const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
  writeFileSync(filePath, response.data);
  return filePath;
}

const emotionCommands = {};

for (const emotion of emotions) {
  emotionCommands[emotion] = async (sock, msg, args) => {
    try {
      const sender = msg.pushName || "Someone";
      const senderJid = msg.key.participant || msg.key.remoteJid;

      // Detect mention target
      const mentionedJid =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
        msg.message?.extendedTextMessage?.contextInfo?.participant ||
        msg.key.remoteJid;

      const gifUrl = await getEmotionGif(emotion);
      const filePath = await downloadGif(gifUrl);

      // Construct caption with mentions
      const caption = `@${senderJid.split('@')[0]} ${emotion}s @${mentionedJid.split('@')[0]}`;

      await sock.sendMessage(msg.key.remoteJid, {
        video: { url: filePath },
        gifPlayback: true,
        caption,
        mentions: [senderJid, mentionedJid]
      });

      unlinkSync(filePath); // Clean temp file
    } catch (err) {
      console.error(`❌ Error sending ${emotion}:`, err.message);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Failed to send *${emotion}* gif.`
      });
    }
  };
}

export default emotionCommands;