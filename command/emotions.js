// commands/emotions.js
// 📦 LiamBot Emotions Commands

export default {
  kiss(sock, msg, args) {
    const target = args.join(" ") || "someone special";
    sock.sendMessage(msg.key.remoteJid, { text: `😘 You kissed ${target}!` });
  },

  slap(sock, msg, args) {
    const target = args.join(" ") || "someone";
    sock.sendMessage(msg.key.remoteJid, { text: `👋 You slapped ${target}!` });
  },

  hug(sock, msg, args) {
    const target = args.join(" ") || "a friend";
    sock.sendMessage(msg.key.remoteJid, { text: `🤗 You gave ${target} a warm hug!` });
  },

  poke(sock, msg, args) {
    const target = args.join(" ") || "someone";
    sock.sendMessage(msg.key.remoteJid, { text: `👉 You poked ${target}!` });
  },

  cuddle(sock, msg, args) {
    const target = args.join(" ") || "someone";
    sock.sendMessage(msg.key.remoteJid, { text: `🛌 You cuddled with ${target}!` });
  },

  pat(sock, msg, args) {
    const target = args.join(" ") || "someone";
    sock.sendMessage(msg.key.remoteJid, { text: `👋 You patted ${target} on the head!` });
  },

  bite(sock, msg, args) {
    const target = args.join(" ") || "someone";
    sock.sendMessage(msg.key.remoteJid, { text: `😬 You bit ${target}!` });
  },

  dance(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "💃 You started dancing!" });
  },

  cry(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "😭 You burst into tears!" });
  },

  laugh(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "😂 You started laughing uncontrollably!" });
  },

  wave(sock, msg, args) {
    const target = args.join(" ") || "everyone";
    sock.sendMessage(msg.key.remoteJid, { text: `👋 You waved at ${target}!` });
  },

  smile(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "😊 You smiled brightly!" });
  },

  angry(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "😠 You're feeling angry!" });
  },

  blush(sock, msg) {
    sock.sendMessage(msg.key.remoteJid, { text: "😊 You're blushing!" });
  },

  highfive(sock, msg, args) {
    const target = args.join(" ") || "someone";
    sock.sendMessage(msg.key.remoteJid, { text: `✋ You gave a high-five to ${target}!` });
  }
};