// commands/fifashop.js // 📦 LiamBot FIFA Shop Commands

import * as memory from '../memory.js';

const fifaCards = [ { name: "Lionel Messi", price: 5000, rarity: "Legendary", position: "RW", rating: 94, stats: { PAC: 85, SHO: 92, PAS: 91, DRI: 96, DEF: 38, PHY: 65 }, image: "https://example.com/messi.gif" }, { name: "Cristiano Ronaldo", price: 4800, rarity: "Legendary", position: "ST", rating: 93, stats: { PAC: 87, SHO: 93, PAS: 82, DRI: 88, DEF: 35, PHY: 77 }, image: "https://example.com/ronaldo.gif" }, // Add more player cards below... ];

const hypeMessages = [ "🎉 The crowd goes wild!", "🔥 What a signing!", "💥 Player incoming...", "🎮 Ultimate Team just got stronger!", "⭐ FIFA card unlocked!" ];

export default { async fifashop(sock, msg) { let shopText = `🏟️ FIFA Card Shop

Available Players:

; fifaCards.forEach(card => { shopText += • ${card.name} — 💰 ${card.price} coins | ⭐ ${card.rarity} | ${card.position} | 🏅 ${card.rating}\n; }); shopText += \nUse .buy [player name] to purchase a card.`; await sock.sendMessage(msg.key.remoteJid, { text: shopText }); },

async buy(sock, msg, args) { if (!args.length) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .buy [player name]" });

const playerName = args.join(" ");
const card = fifaCards.find(c => c.name.toLowerCase() === playerName.toLowerCase());

if (!card) return sock.sendMessage(msg.key.remoteJid, { text: `❌ Player *${playerName}* not found.` });

const userId = msg.key.participant || msg.key.remoteJid;
const wallet = memory.getWallet(userId);

if (wallet < card.price) {
  return sock.sendMessage(msg.key.remoteJid, { text: `💸 Not enough coins! You have ${wallet}, but need ${card.price}.` });
}

memory.setWallet(userId, wallet - card.price);
memory.addCard(userId, card.name);

for (let msgText of hypeMessages) {
  await sock.sendMessage(msg.key.remoteJid, { text: msgText });
  await new Promise(res => setTimeout(res, 1000));
}

await sock.sendMessage(msg.key.remoteJid, {
  video: { url: card.image },
  caption: `🎴 *${card.name}* | ${card.position} | 🏅 ${card.rating}\n⭐ ${card.rarity}\n📊 PAC: ${card.stats.PAC}, SHO: ${card.stats.SHO}, PAS: ${card.stats.PAS},\nDRI: ${card.stats.DRI}, DEF: ${card.stats.DEF}, PHY: ${card.stats.PHY}\n💰 -${card.price} coins`
});

},

async flex(sock, msg, args) { if (!args.length) return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .flex [player name]" });

const playerName = args.join(" ");
const userId = msg.key.participant || msg.key.remoteJid;
const ownedCards = memory.getCards(userId);

if (!ownedCards.includes(playerName)) {
  return sock.sendMessage(msg.key.remoteJid, { text: `❌ You don't own *${playerName}*.` });
}

const card = fifaCards.find(c => c.name.toLowerCase() === playerName.toLowerCase());

for (let msgText of hypeMessages) {
  await sock.sendMessage(msg.key.remoteJid, { text: `⚽ ${msgText}` });
  await new Promise(res => setTimeout(res, 800));
}

await sock.sendMessage(msg.key.remoteJid, {
  video: { url: card.image },
  caption: `🎴 *${card.name}* | ${card.position} | 🏅 ${card.rating}\n⭐ ${card.rarity}\n📊 PAC: ${card.stats.PAC}, SHO: ${card.stats.SHO}, PAS: ${card.stats.PAS},\nDRI: ${card.stats.DRI}, DEF: ${card.stats.DEF}, PHY: ${card.stats.PHY}`
});

},

async mycards(sock, msg) { const userId = msg.key.participant || msg.key.remoteJid; const cards = memory.getCards(userId);

if (!cards.length) return sock.sendMessage(msg.key.remoteJid, { text: "📦 You don't own any FIFA cards yet. Buy some with .fifashop!" });

let cardText = `🎴 *Your FIFA Cards:*

; cards.forEach(name => { const card = fifaCards.find(c => c.name === name); if (card) { cardText += • ${card.name} | ${card.position} | 🏅 ${card.rating} | ⭐ ${card.rarity}\n`; } });

await sock.sendMessage(msg.key.remoteJid, { text: cardText });

},

async sell(sock, msg, args) { if (args.length < 2 || !msg.message.extendedTextMessage?.mentionedJid?.length) { return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .sell [player name] @user" }); }

const playerName = args.slice(0, -1).join(" ");
const card = fifaCards.find(c => c.name.toLowerCase() === playerName.toLowerCase());
const targetId = msg.message.extendedTextMessage.mentionedJid[0];
const sellerId = msg.key.participant || msg.key.remoteJid;

if (!memory.getCards(sellerId).includes(card.name)) {
  return sock.sendMessage(msg.key.remoteJid, { text: `❌ You don't own *${card.name}*.` });
}

memory.setPendingTrade(targetId, {
  card: card.name,
  price: card.price,
  from: sellerId
});

await sock.sendMessage(msg.key.remoteJid, { text: `💼 Offer sent to <@${targetId.split("@")[0]}> to buy *${card.name}* for 💰 ${card.price} coins. They must reply with *.accept @${msg.pushName}*.` });

},

async accept(sock, msg) { const buyerId = msg.key.participant || msg.key.remoteJid; const trade = memory.getPendingTrade(buyerId); if (!trade) return sock.sendMessage(msg.key.remoteJid, { text: "❌ No pending trade found." });

const buyerWallet = memory.getWallet(buyerId);
if (buyerWallet < trade.price) return sock.sendMessage(msg.key.remoteJid, { text: `💸 Not enough coins to complete the trade.` });

memory.setWallet(buyerId, buyerWallet - trade.price);
memory.addCard(buyerId, trade.card);
memory.removeCard(trade.from, trade.card);
memory.clearPendingTrade(buyerId);

await sock.sendMessage(msg.key.remoteJid, { text: `✅ Trade complete! You received *${trade.card}* for 💰 ${trade.price} coins.` });

} };

