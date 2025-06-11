// commands/music.js
// 📦 LiamBot Music Commands (text-based for now)

export function play(sock, msg, args) {
  if (!args.length) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .play [song name]" });
  const song = args.join(" ");
  sock.sendMessage(msg.key.remoteJid, { text: `🎶 Playing *${song}* (simulated)` });
}

export function pause(sock, msg) {
  sock.sendMessage(msg.key.remoteJid, { text: "⏸️ Music paused." });
}

export function resume(sock, msg) {
  sock.sendMessage(msg.key.remoteJid, { text: "▶️ Music resumed." });
}

export function skip(sock, msg) {
  sock.sendMessage(msg.key.remoteJid, { text: "⏭️ Skipped to the next track." });
}

export function queue(sock, msg) {
  sock.sendMessage(msg.key.remoteJid, { text: "🎵 Current queue: [empty / simulated]" });
}

export function stop(sock, msg) {
  sock.sendMessage(msg.key.remoteJid, { text: "⏹️ Music stopped." });
}

export function nowplaying(sock, msg) {
  sock.sendMessage(msg.key.remoteJid, { text: "🎶 Now playing: [simulated song]" });
}

export function volume(sock, msg, args) {
  if (!args.length) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .volume [1-100]" });
  const volume = parseInt(args[0]);
  if (isNaN(volume) || volume < 1 || volume > 100) return sock.sendMessage(msg.key.remoteJid, { text: "Volume must be 1-100." });
  sock.sendMessage(msg.key.remoteJid, { text: `🔊 Volume set to ${volume}%` });
}

export function lyrics(sock, msg, args) {
  if (!args.length) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .lyrics [song name]" });
  const song = args.join(" ");
  sock.sendMessage(msg.key.remoteJid, { text: `📜 Lyrics for *${song}* not available (simulated)` });
}

export function shuffle(sock, msg) {
  sock.sendMessage(msg.key.remoteJid, { text: "🔀 Queue shuffled." });
}

export function repeat(sock, msg) {
  sock.sendMessage(msg.key.remoteJid, { text: "🔁 Repeat mode toggled." });
}

export function join(sock, msg) {
  sock.sendMessage(msg.key.remoteJid, { text: "🎶 Bot joined voice channel (simulated)" });
}

export function leave(sock, msg) {
  sock.sendMessage(msg.key.remoteJid, { text: "👋 Left the voice channel (simulated)" });
}

export function search(sock, msg, args) {
  if (!args.length) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .search [song name]" });
  const song = args.join(" ");
  sock.sendMessage(msg.key.remoteJid, { text: `🔍 Found: *${song}* (simulated result)` });
}

export function playlist(sock, msg) {
  sock.sendMessage(msg.key.remoteJid, { text: "🎵 Playlist feature coming soon!" });
}