import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

// Helper: Temp file path
function getTempFilePath(ext = '') {
  return path.join(tmpdir(), `music_${Date.now()}${ext}`);
}

// 🎵 .play command
export async function play(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const query = args.join(' ');

  if (!query) {
    return sock.sendMessage(chatId, {
      text: "🎵 Usage: `.play [song name]` — I’ll send you the song as an audio!",
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