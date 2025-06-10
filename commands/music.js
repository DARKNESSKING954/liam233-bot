// commands/music.js
// 📦 LiamBot Music Commands (text-based for now)

module.exports = {
  play(sock, msg, args) {
    if (!args.length) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .play [song name]" });
    const song = args.join(" ");
    sock.sendMessage(msg.key.remoteJid, { text: `🎶 Playing *${song}* (simulated)` });
  },

  pause(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "⏸️ Music paused." });
  },

  resume(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "▶️ Music resumed." });
  },

  skip(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "⏭️ Skipped to the next track." });
  },

  queue(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "🎵 Current queue: [empty / simulated]" });
  },

  stop(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "⏹️ Music stopped." });
  },

  nowplaying(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "🎶 Now playing: [simulated song]" });
  },

  volume(sock, msg, args) {
    if (!args.length) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .volume [1-100]" });
    const volume = parseInt(args[0]);
    if (isNaN(volume) || volume < 1 || volume > 100) return sock.sendMessage(msg.key.remoteJid, { text: "Volume must be 1-100." });
    sock.sendMessage(msg.key.remoteJid, { text: `🔊 Volume set to ${volume}%` });
  },

  lyrics(sock, msg, args) {
    if (!args.length) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .lyrics [song name]" });
    const song = args.join(" ");
    sock.sendMessage(msg.key.remoteJid, { text: `📜 Lyrics for *${song}* not available (simulated)` });
  },

  shuffle(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "🔀 Queue shuffled." });
  },

  repeat(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "🔁 Repeat mode toggled." });
  },

  join(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "🎶 Bot joined voice channel (simulated)" });
  },

  leave(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "👋 Left the voice channel (simulated)" });
  },

  search(sock, msg, args) {
    if (!args.length) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .search [song name]" });
    const song = args.join(" ");
    sock.sendMessage(msg.key.remoteJid, { text: `🔍 Found: *${song}* (simulated result)` });
  },

  playlist(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "🎵 Playlist feature coming soon!" });
  }
};