// commands/media.js // 📽️ LiamBot Media Commands — sticker, youtube, play, lyrics

import { downloadMediaMessage } from '@whiskeysockets/baileys'; import { Sticker } from 'wa-sticker-formatter'; import ytsr from 'ytsr'; import ytdl from 'ytdl-core'; import axios from 'axios'; import fs from 'fs'; import path from 'path'; import os from 'os';

// --- .sticker [pack] [author] --- export async function sticker(sock, msg, args) { const chatId = msg.key.remoteJid; const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;

if (!quoted.imageMessage && !quoted.videoMessage && !quoted.stickerMessage) { return sock.sendMessage(chatId, { text: '❌ Reply to an image, short video, or sticker with .sticker pack author' }); }

if (args.length < 2) { return sock.sendMessage(chatId, { text: '❌ Usage: .sticker [pack] [author]' }); }

const pack = args[0]; const author = args.slice(1).join(' ');

const mediaBuffer = await downloadMediaMessage( { message: quoted }, 'buffer', {}, { logger: console, reuploadRequest: sock.updateMediaMessage } );

const sticker = new Sticker(mediaBuffer, { pack: pack, author: author, type: quoted.videoMessage ? 'video' : 'full', });

const buffer = await sticker.toBuffer(); await sock.sendMessage(chatId, { sticker: buffer }); }

// --- .youtube [search] --- export async function youtube(sock, msg, args) { const chatId = msg.key.remoteJid; if (!args.length) return sock.sendMessage(chatId, { text: '🔍 Usage: .youtube [search]' });

const query = args.join(' '); const result = (await ytsr(query, { limit: 5 })).items.find((v) => v.type === 'video'); if (!result) return sock.sendMessage(chatId, { text: '❌ No video found!' });

const videoUrl = result.url; const info = await ytdl.getInfo(videoUrl); const durationSec = parseInt(info.videoDetails.lengthSeconds); if (durationSec > 1800) return sock.sendMessage(chatId, { text: '⏳ Video is over 30 minutes. Try a shorter one!' });

const format = ytdl.chooseFormat(info.formats, { quality: '18' }); // 360p mp4 const output = path.join(os.tmpdir(), ${Date.now()}.mp4);

await new Promise((resolve, reject) => { ytdl(videoUrl, { format }) .pipe(fs.createWriteStream(output)) .on('finish', resolve) .on('error', reject); });

const videoBuffer = fs.readFileSync(output); fs.unlinkSync(output);

await sock.sendMessage(chatId, { video: videoBuffer, mimetype: 'video/mp4', caption: 🎬 ${result.title}, }); }

// --- .play [song name] --- export async function play(sock, msg, args) { const chatId = msg.key.remoteJid; if (!args.length) return sock.sendMessage(chatId, { text: '🎵 Usage: .play [song name]' });

const query = args.join(' '); const result = (await ytsr(query, { limit: 5 })).items.find((v) => v.type === 'video'); if (!result) return sock.sendMessage(chatId, { text: '❌ Song not found!' });

const videoUrl = result.url; const info = await ytdl.getInfo(videoUrl); const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' }); const output = path.join(os.tmpdir(), ${Date.now()}.mp3);

await new Promise((resolve, reject) => { ytdl(videoUrl, { format: audioFormat }) .pipe(fs.createWriteStream(output)) .on('finish', resolve) .on('error', reject); });

const audioBuffer = fs.readFileSync(output); fs.unlinkSync(output);

await sock.sendMessage(chatId, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: false, fileName: ${result.title}.mp3, caption: 🎧 Now playing: *${result.title}*, }); }

// --- .lyrics [song name] --- export async function lyrics(sock, msg, args) { const chatId = msg.key.remoteJid; if (!args.length) return sock.sendMessage(chatId, { text: '🎤 Usage: .lyrics [song name]' });

const query = args.join(' '); try { const res = await axios.get(https://api.lyrics.ovh/v1/unknown/${encodeURIComponent(query)}); if (res.data?.lyrics) { const lyrics = res.data.lyrics.length > 3900 ? res.data.lyrics.slice(0, 3900) + '\n\n[...truncated]' : res.data.lyrics; await sock.sendMessage(chatId, { text: 🎶 Lyrics for *${query}*:\n\n${lyrics}, }); } else { throw new Error('No lyrics found'); } } catch { return sock.sendMessage(chatId, { text: ❌ Lyrics not found for "${query}". Try another song!, }); } }

