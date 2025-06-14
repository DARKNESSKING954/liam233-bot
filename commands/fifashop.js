// commands/fifashop.js // 🎟️ LiamBot FIFA Shop Commands

import * as memory from '../memory.js'; import { getUserId, sleep } from '../utils.js';

const fifaCards = [ { name: "Lionel Messi", rating: 93, position: "RW", price: 5000, rarity: "Legendary", image: "https://example.com/messi.gif" }, { name: "Cristiano Ronaldo", rating: 92, position: "ST", price: 4800, rarity: "Legendary", image: "https://example.com/ronaldo.gif" }, { name: "Kylian Mbappe", rating: 91, position: "ST", price: 4700, rarity: "Epic", image: "https://example.com/mbappe.gif" }, { name: "Kevin De Bruyne", rating: 91, position: "CAM", price: 4600, rarity: "Epic", image: "https://example.com/debruyne.gif" }, { name: "Erling Haaland", rating: 90, position: "ST", price: 4500, rarity: "Epic", image: "https://example.com/haaland.gif" } ];

export default { async fifashop(sock, msg) { let text = `🎟️ LiamBot FIFA Shop

Available Cards:

; for (const card of fifaCards) { text += • ${card.name} (${card.position}) - 🔹 ${card.rating} | ⭐ ${card.rarity} | 💰 ${card.price} ; } text += \nUse .buy [player name] to buy a card.`; await sock.sendMessage(msg.key.remoteJid, { text }); },

async buy(sock, msg, args) { const userId = getUserId(msg); const name = args.join(" ").toLowerCase(); const card = fifaCards.find(c => c.name.toLowerCase() === name);

if (!card) return sock.sendMessage(msg.key.remoteJid, { text: `❌ Player not found.` });

const wallet = memory.getWallet(userId);
if (wallet < card.price) return sock.sendMessage(msg.key.remoteJid, { text: `🚫 You need ${card.price} coins. You have ${wallet}.` });

memory.removeCoins(userId, card.price);
memory.addCard(userId, card.name);

await sock.sendMessage(msg.key.remoteJid, { video: { url: card.image }, gifPlayback: true });
await sleep(1500);
await sock.sendMessage(msg.key.remoteJid, { text: `🌟 *SIGNED!* ${card.name} is now yours!` });
await sleep(1200);
await sock.sendMessage(msg.key.remoteJid, { text: `📊 Overall Rating: ${card.rating} | Position: ${card.position}` });
await sleep(1000);
await sock.sendMessage(msg.key.remoteJid, { text: `💰 Spent: ${card.price} coins | Rarity: ${card.rarity}` });
await sleep(1000);
await sock.sendMessage(msg.key.remoteJid, { text: `✨ Card added to your collection. Flex it with *.flex ${card.name}*` });

},

async flex(sock, msg, args) { const userId = getUserId(msg); const name = args.join(" ").toLowerCase(); const card = fifaCards.find(c => c.name.toLowerCase() === name);

if (!card) return sock.sendMessage(msg.key.remoteJid, { text: `❌ Card not found.` });

const cards = memory.getCards(userId);
if (!cards.includes(card.name)) return sock.sendMessage(msg.key.remoteJid, { text: `⚠️ You don't own ${card.name}` });

await sock.sendMessage(msg.key.remoteJid, { video: { url: card.image }, gifPlayback: true });
await sleep(1000);
await sock.sendMessage(msg.key.remoteJid, { text: `🔥 *${card.name} enters the field!*` });
await sleep(1000);
await sock.sendMessage(msg.key.remoteJid, { text: `🌟 Rating: ${card.rating} | Position: ${card.position}` });
await sleep(1000);
await sock.sendMessage(msg.key.remoteJid, { text: `⭐ Rarity: ${card.rarity}` });
await sleep(1000);
await sock.sendMessage(msg.key.remoteJid, { text: `🥇 Card Value: ${card.price} coins` });

},

async mycards(sock, msg) { const userId = getUserId(msg); const cards = memory.getCards(userId);

if (!cards.length) return sock.sendMessage(msg.key.remoteJid, { text: `🚫 You don't own any cards.` });

let text = `🎴 *Your FIFA Cards:*

; for (const name of cards) { const card = fifaCards.find(c => c.name === name); text += • ${card.name} - 🌟 ${card.rating} ${card.position} | 💰 ${card.price} `; } await sock.sendMessage(msg.key.remoteJid, { text }); },

async sell(sock, msg, args) { const userId = getUserId(msg); const price = parseInt(args[0]); const name = args.slice(1).join(" "); if (isNaN(price) || !name) return sock.sendMessage(msg.key.remoteJid, { text: Usage: .sell [price] [player] });

const card = fifaCards.find(c => c.name.toLowerCase() === name.toLowerCase());
if (!card) return sock.sendMessage(msg.key.remoteJid, { text: `❌ Card not found.` });

const cards = memory.getCards(userId);
if (!cards.includes(card.name)) return sock.sendMessage(msg.key.remoteJid, { text: `❌ You don't own ${card.name}` });

global.fifaTrades = global.fifaTrades || {};
global.fifaTrades[card.name.toLowerCase()] = { seller: userId, price };

await sock.sendMessage(msg.key.remoteJid, { text: `ℹ️ ${card.name} is now listed for sale at ${price} coins!

Buy it with .accept @${msg.pushName}` }); },

async accept(sock, msg, args) { const userId = getUserId(msg); const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]; const targetUser = mentioned || args[0];

if (!targetUser) return sock.sendMessage(msg.key.remoteJid, { text: `Usage: .accept @seller` });

const trade = Object.entries(global.fifaTrades || {}).find(([, data]) => data.seller === targetUser);
if (!trade) return sock.sendMessage(msg.key.remoteJid, { text: `❌ No cards found listed by that user.` });

const [cardName, { price, seller }] = trade;
const wallet = memory.getWallet(userId);
if (wallet < price) return sock.sendMessage(msg.key.remoteJid, { text: `🚫 You need ${price} coins.` });

memory.removeCoins(userId, price);
memory.addCoins(seller, price);
memory.removeCard(seller, cardName);
memory.addCard(userId, cardName);

delete global.fifaTrades[cardName];

const card = fifaCards.find(c => c.name.toLowerCase() === cardName);
await sock.sendMessage(msg.key.remoteJid, { video: { url: card.image }, gifPlayback: true });
await sleep(1200);
await sock.sendMessage(msg.key.remoteJid, { text: `🚀 ${card.name} has transferred clubs!

🤝 Welcome to your squad!` }); } };

