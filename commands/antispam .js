// 🚨 LiamBot Anti-Spam & Moderation System
import { isAdmin } from '../utils.js';
import * as memory from '../memory.js';

const toggles = {};
const spamTracker = {};
const badWords = new Set(["fuck", "shit", "bitch", "asshole", "nigga", "dick"]); // Default bad words

function isLink(text) {
  return /(https?:\/\/|www\.|\.com|\.net|\.org|t\.me|wa\.me)/gi.test(text);
}

export default {
  // 🚨 .antispam
  async antispam(sock, msg, args) {
    if (!(await isAdmin(sock, msg))) 
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can toggle anti-spam!*" });
    const status = args[0];
    if (!["on", "off"].includes(status)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `🤖 Usage: *.antispam on/off*\n\nWhen enabled, users who repeat messages 3 times in a row will be *auto-yeeted* 👢 from the group!`
      });
    }
    toggles.antispam = status === "on";
    sock.sendMessage(msg.key.remoteJid, {
      text: `🚨 Anti-Spam has been turned *${status.toUpperCase()}*!\n📛 Repeat spammers will be kicked out!`
    });
  },

  // 🖇️ .antilink
  async antilink(sock, msg, args) {
    if (!(await isAdmin(sock, msg))) 
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can toggle anti-link!*" });
    const status = args[0];
    if (!["on", "off"].includes(status)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `🔗 Usage: *.antilink on/off*\n\nLinks are *illegal* here! Anyone who sends a link will be *kicked instantly*!`
      });
    }
    toggles.antilink = status === "on";
    sock.sendMessage(msg.key.remoteJid, {
      text: `🚨 Anti-Link is *${status.toUpperCase()}*!\n💣 Link droppers beware!`
    });
  },

  // 🤬 .antiswearing
  async antiswearing(sock, msg, args) {
    if (!(await isAdmin(sock, msg))) 
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can toggle anti-swearing!*" });
    const status = args[0];
    if (!["on", "off"].includes(status)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `😤 Usage: *.antiswearing on/off*\n\nWhen enabled, users who swear will be *blasted out of the chat* 🚀\n\n💡 You can also add custom bad words with *.addbadword [word]* and remove them with *.removebadword [word]*`
      });
    }
    toggles.antiswearing = status === "on";
    sock.sendMessage(msg.key.remoteJid, {
      text: `🧼 Anti-Swearing is *${status.toUpperCase()}*!\n💢 Bad-mouthers will be booted!`
    });
  },

  async addbadword(sock, msg, args) {
    if (!(await isAdmin(sock, msg))) 
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can add bad words!*" });
    const word = args[0]?.toLowerCase();
    if (!word) return sock.sendMessage(msg.key.remoteJid, { text: "📌 Usage: *.addbadword [word]*" });
    badWords.add(word);
    sock.sendMessage(msg.key.remoteJid, { text: `☠️ Word *${word}* added to the naughty list!` });
  },

  async removebadword(sock, msg, args) {
    if (!(await isAdmin(sock, msg))) 
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can remove bad words!*" });
    const word = args[0]?.toLowerCase();
    if (!word) return sock.sendMessage(msg.key.remoteJid, { text: "📌 Usage: *.removebadword [word]*" });
    badWords.delete(word);
    sock.sendMessage(msg.key.remoteJid, { text: `✅ Word *${word}* removed from the naughty list!` });
  },

  async antiimage(sock, msg, args) {
    if (!(await isAdmin(sock, msg))) 
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can toggle anti-image!*" });
    const status = args[0];
    if (!["on", "off"].includes(status)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `🖼️ Usage: *.antiimage on/off*\n\nNo more meme spam! Users sending images will be removed instantly!`
      });
    }
    toggles.antiimage = status === "on";
    sock.sendMessage(msg.key.remoteJid, {
      text: `📷 Anti-Image is now *${status.toUpperCase()}*!`
    });
  },

  async antivideo(sock, msg, args) {
    if (!(await isAdmin(sock, msg))) 
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can toggle anti-video!*" });
    const status = args[0];
    if (!["on", "off"].includes(status)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `🎥 Usage: *.antivideo on/off*\n\nNo videos allowed! Send a vid, get a boot!`
      });
    }
    toggles.antivideo = status === "on";
    sock.sendMessage(msg.key.remoteJid, {
      text: `🎬 Anti-Video is now *${status.toUpperCase()}*!`
    });
  },

  async antisticker(sock, msg, args) {
    if (!(await isAdmin(sock, msg))) 
      return sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Only admins can toggle anti-sticker!*" });
    const status = args[0];
    if (!["on", "off"].includes(status)) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `🧻 Usage: *.antisticker on/off*\n\nNo sticker spam here! One sticker = one kick!`
      });
    }
    toggles.antisticker = status === "on";
    sock.sendMessage(msg.key.remoteJid, {
      text: `📦 Anti-Sticker is now *${status.toUpperCase()}*!`
    });
  },

  // 🧠 Message Middleware
  async handleMessage(sock, msg) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderId = sender.includes(":") ? sender.split(":")[0] : sender;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const msgType = Object.keys(msg.message || {})[0];

    try {
      if (toggles.antispam) {
        const prev = spamTracker[senderId] || { text: "", count: 0 };
        if (prev.text === text) {
          prev.count += 1;
          if (prev.count >= 3) {
            await sock.groupParticipantsUpdate(from, [senderId], "remove");
            return sock.sendMessage(from, { text: `🔁 @${senderId.split('@')[0]} removed for spamming the same message 3 times!`, mentions: [senderId] });
          }
        } else {
          prev.text = text;
          prev.count = 1;
        }
        spamTracker[senderId] = prev;
      }

      if (toggles.antilink && isLink(text)) {
        await sock.groupParticipantsUpdate(from, [senderId], "remove");
        return sock.sendMessage(from, { text: `🔗 @${senderId.split('@')[0]} dropped a suspicious link and got the *ban hammer!* 🛠️`, mentions: [senderId] });
      }

      if (toggles.antiswearing && [...badWords].some(w => text.toLowerCase().includes(w))) {
        await sock.groupParticipantsUpdate(from, [senderId], "remove");
        return sock.sendMessage(from, { text: `😤 @${senderId.split('@')[0]} got kicked for being *too spicy*! 🔥`, mentions: [senderId] });
      }

      if (toggles.antiimage && msgType === "imageMessage") {
        await sock.groupParticipantsUpdate(from, [senderId], "remove");
        return sock.sendMessage(from, { text: `📸 @${senderId.split('@')[0]} sent an image and got *deleted* from the gallery!`, mentions: [senderId] });
      }

      if (toggles.antivideo && msgType === "videoMessage") {
        await sock.groupParticipantsUpdate(from, [senderId], "remove");
        return sock.sendMessage(from, { text: `🎬 @${senderId.split('@')[0]} tried to premiere a video. They got canceled!`, mentions: [senderId] });
      }

      if (toggles.antisticker && msgType === "stickerMessage") {
        await sock.groupParticipantsUpdate(from, [senderId], "remove");
        return sock.sendMessage(from, { text: `🧻 @${senderId.split('@')[0]} thought stickers were fun... until they got kicked.`, mentions: [senderId] });
      }
    } catch (e) {
      console.error("🚨 AntiSpam error:", e.message);
    }
  }
};