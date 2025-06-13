import { isAdmin, getUserId } from '../utils.js';

const toggles = {
  antispam: false,
  antilink: false,
  antisticker: false,
  antiswearing: false,
  antiimage: false,
  antivideo: false,
};
const spamTracker = {};
const badWords = new Set(["fuck", "shit", "bitch", "asshole", "nigga", "dick"]); // Default naughty list

function isLink(text) {
  return /(https?:\/\/|www\.|\.com|\.net|\.org|t\.me|wa\.me)/gi.test(text);
}

export default {
  name: 'antispam',

  // Command handlers

  async antispam(sock, msg, args) {
    if (!(await isAdmin(sock, msg.key.remoteJid, getUserId(msg)))) {
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can toggle anti-spam!*" });
    }
    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `🤖 Usage: *.antispam on/off*\n\nWhen enabled, users who repeat the same message 3 times in a row will be *auto-yeeted* 👢 from the group!`
      });
    }
    toggles.antispam = status === "on";
    sock.sendMessage(msg.key.remoteJid, { text: `🚨 Anti-Spam is now *${status.toUpperCase()}*!` });
  },

  async antilink(sock, msg, args) {
    if (!(await isAdmin(sock, msg.key.remoteJid, getUserId(msg)))) {
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can toggle anti-link!*" });
    }
    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `🔗 Usage: *.antilink on/off*\n\nLinks are *illegal* here! Anyone who sends a link will be *kicked instantly*!`
      });
    }
    toggles.antilink = status === "on";
    sock.sendMessage(msg.key.remoteJid, { text: `🚨 Anti-Link is now *${status.toUpperCase()}*!` });
  },

  async antiswearing(sock, msg, args) {
    if (!(await isAdmin(sock, msg.key.remoteJid, getUserId(msg)))) {
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can toggle anti-swearing!*" });
    }
    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text:
          `😤 Usage: *.antiswearing on/off*\n\n` +
          `When enabled, users who swear will be *blasted out of the chat* 🚀\n\n` +
          `💡 Add your own custom bad words using *.addbadword [word]* and remove them with *.removebadword [word]*`
      });
    }
    toggles.antiswearing = status === "on";
    sock.sendMessage(msg.key.remoteJid, { text: `🧼 Anti-Swearing is now *${status.toUpperCase()}*!` });
  },

  async addbadword(sock, msg, args) {
    if (!(await isAdmin(sock, msg.key.remoteJid, getUserId(msg)))) {
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can add bad words!*" });
    }
    const word = args[0]?.toLowerCase();
    if (!word) {
      return sock.sendMessage(msg.key.remoteJid, { text: "📌 Usage: *.addbadword [word]*" });
    }
    badWords.add(word);
    sock.sendMessage(msg.key.remoteJid, { text: `☠️ Word *${word}* added to the naughty list!` });
  },

  async removebadword(sock, msg, args) {
    if (!(await isAdmin(sock, msg.key.remoteJid, getUserId(msg)))) {
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can remove bad words!*" });
    }
    const word = args[0]?.toLowerCase();
    if (!word) {
      return sock.sendMessage(msg.key.remoteJid, { text: "📌 Usage: *.removebadword [word]*" });
    }
    badWords.delete(word);
    sock.sendMessage(msg.key.remoteJid, { text: `✅ Word *${word}* removed from the naughty list!` });
  },

  async antiimage(sock, msg, args) {
    if (!(await isAdmin(sock, msg.key.remoteJid, getUserId(msg)))) {
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can toggle anti-image!*" });
    }
    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `🖼️ Usage: *.antiimage on/off*\n\nNo more meme spam! Users sending images will be removed instantly!`
      });
    }
    toggles.antiimage = status === "on";
    sock.sendMessage(msg.key.remoteJid, { text: `📷 Anti-Image is now *${status.toUpperCase()}*!` });
  },

  async antivideo(sock, msg, args) {
    if (!(await isAdmin(sock, msg.key.remoteJid, getUserId(msg)))) {
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can toggle anti-video!*" });
    }
    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `🎥 Usage: *.antivideo on/off*\n\nNo videos allowed! Send a vid, get a boot!`
      });
    }
    toggles.antivideo = status === "on";
    sock.sendMessage(msg.key.remoteJid, { text: `🎬 Anti-Video is now *${status.toUpperCase()}*!` });
  },

  async antisticker(sock, msg, args) {
    if (!(await isAdmin(sock, msg.key.remoteJid, getUserId(msg)))) {
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can toggle anti-sticker!*" });
    }
    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `🧻 Usage: *.antisticker on/off*\n\nNo sticker spam here! One sticker = one kick!`
      });
    }
    toggles.antisticker = status === "on";
    sock.sendMessage(msg.key.remoteJid, { text: `📦 Anti-Sticker is now *${status.toUpperCase()}*!` });
  },

  // Message handler to be called from your index.js on 'message' event
  async handleMessage(sock, msg) {
    const from = msg.key.remoteJid;
    // Only process group chats
    if (!from.endsWith('@g.us')) return;

    const sender = getUserId(msg);

    // Skip admins
    if (await isAdmin(sock, from, sender)) return;

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const msgType = Object.keys(msg.message || {})[0];

    // Anti-Spam
    if (toggles.antispam) {
      const prev = spamTracker[sender] || { text: "", count: 0 };
      if (prev.text === text && text !== "") {
        prev.count++;
        if (prev.count >= 3) {
          try {
            await sock.groupParticipantsUpdate(from, [sender], "remove");
            await sock.sendMessage(from, { text: `🔁 @${sender.split('@')[0]} removed for spamming the same message 3 times!`, mentions: [sender] });
            spamTracker[sender] = { text: "", count: 0 }; // reset after kick
          } catch (e) {
            console.error("Failed to remove spammer:", e);
          }
          return;
        }
      } else {
        spamTracker[sender] = { text, count: 1 };
      }
    }

    // Anti-Link
    if (toggles.antilink && isLink(text)) {
      try {
        await sock.groupParticipantsUpdate(from, [sender], "remove");
        await sock.sendMessage(from, { text: `🔗 @${sender.split('@')[0]} dropped a suspicious link and got the *ban hammer!* 🛠️`, mentions: [sender] });
      } catch (e) {
        console.error("Failed to remove link sender:", e);
      }
      return;
    }

    // Anti-Swearing
    if (toggles.antiswearing && [...badWords].some(w => text.toLowerCase().includes(w))) {
      try {
        await sock.groupParticipantsUpdate(from, [sender], "remove");
        await sock.sendMessage(from, { text: `😤 @${sender.split('@')[0]} got kicked for being *too spicy*! 🔥`, mentions: [sender] });
      } catch (e) {
        console.error("Failed to remove swearer:", e);
      }
      return;
    }

    // Anti-Image
    if (toggles.antiimage && msgType === "imageMessage") {
      try {
        await sock.groupParticipantsUpdate(from, [sender], "remove");
        await sock.sendMessage(from, { text: `📸 @${sender.split('@')[0]} sent an image and got *deleted* from the gallery!`, mentions: [sender] });
      } catch (e) {
        console.error("Failed to remove image sender:", e);
      }
      return;
    }

    // Anti-Video
    if (toggles.antivideo && msgType === "videoMessage") {
      try {
        await sock.groupParticipantsUpdate(from, [sender], "remove");
        await sock.sendMessage(from, { text: `🎬 @${sender.split('@')[0]} tried to premiere a video. They got canceled!`, mentions: [sender] });
      } catch (e) {
        console.error("Failed to remove video sender:", e);
      }
      return;
    }

    // Anti-Sticker
    if (toggles.antisticker && msgType === "stickerMessage") {
      try {
        await sock.groupParticipantsUpdate(from, [sender], "remove");
        await sock.sendMessage(from, { text: `🧻 @${sender.split('@')[0]} thought stickers were fun... until they got kicked.`, mentions: [sender] });
      } catch (e) {
        console.error("Failed to remove sticker sender:", e);
      }
      return;
    }
  }
};