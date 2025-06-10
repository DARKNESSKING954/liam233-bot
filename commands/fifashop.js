// commands/fifashop.js
// 📦 LiamBot FIFA Shop Commands

const memory = require("./memory");

const fifaCards = [
  {
    name: "Lionel Messi",
    price: 1000,
    rarity: "Legendary",
    image: "https://example.com/messi.png"
  },
  {
    name: "Cristiano Ronaldo",
    price: 950,
    rarity: "Legendary",
    image: "https://example.com/ronaldo.png"
  },
  {
    name: "Kylian Mbappe",
    price: 850,
    rarity: "Epic",
    image: "https://example.com/mbappe.png"
  },
  {
    name: "Erling Haaland",
    price: 800,
    rarity: "Epic",
    image: "https://example.com/haaland.png"
  },
  {
    name: "Neymar Jr",
    price: 750,
    rarity: "Epic",
    image: "https://example.com/neymar.png"
  },
  {
    name: "Kevin De Bruyne",
    price: 700,
    rarity: "Epic",
    image: "https://example.com/debruyne.png"
  },
  {
    name: "Robert Lewandowski",
    price: 700,
    rarity: "Epic",
    image: "https://example.com/lewa.png"
  },
  {
    name: "Vinicius Jr",
    price: 650,
    rarity: "Rare",
    image: "https://example.com/vini.png"
  },
  {
    name: "Mohamed Salah",
    price: 600,
    rarity: "Rare",
    image: "https://example.com/salah.png"
  },
  {
    name: "Harry Kane",
    price: 600,
    rarity: "Rare",
    image: "https://example.com/kane.png"
  },
  {
    name: "Luka Modric",
    price: 550,
    rarity: "Rare",
    image: "https://example.com/modric.png"
  },
  {
    name: "Sadio Mane",
    price: 500,
    rarity: "Rare",
    image: "https://example.com/mane.png"
  },
  {
    name: "Pedri",
    price: 480,
    rarity: "Uncommon",
    image: "https://example.com/pedri.png"
  },
  {
    name: "Jude Bellingham",
    price: 470,
    rarity: "Uncommon",
    image: "https://example.com/bellingham.png"
  },
  {
    name: "Phil Foden",
    price: 460,
    rarity: "Uncommon",
    image: "https://example.com/foden.png"
  },
  {
    name: "Antony",
    price: 450,
    rarity: "Uncommon",
    image: "https://example.com/antony.png"
  },
  {
    name: "Declan Rice",
    price: 440,
    rarity: "Uncommon",
    image: "https://example.com/rice.png"
  },
  {
    name: "Jack Grealish",
    price: 430,
    rarity: "Uncommon",
    image: "https://example.com/grealish.png"
  },
  {
    name: "Angel Di Maria",
    price: 420,
    rarity: "Common",
    image: "https://example.com/dimaria.png"
  },
  {
    name: "Karim Benzema",
    price: 410,
    rarity: "Common",
    image: "https://example.com/benzema.png"
  }
];

module.exports = {
  // Show FIFA Shop
  fifashop(sock, msg) {
    let shopText = `🏟️ *FIFA Card Shop*\n\nAvailable Players:\n\n`;
    fifaCards.forEach(card => {
      shopText += `• *${card.name}* — 💰 ${card.price} coins | ⭐ ${card.rarity}\n`;
    });
    shopText += `\nUse *.buy [player name]* to purchase a card.`;
    sock.sendMessage(msg.key.remoteJid, { text: shopText });
  },

  // Buy a card by name
  buy(sock, msg, args) {
    if (!args.length) {
      return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .buy [player name]" });
    }

    const playerName = args.join(" ");
    const card = fifaCards.find(c => c.name.toLowerCase() === playerName.toLowerCase());

    if (!card) {
      return sock.sendMessage(msg.key.remoteJid, { text: `❌ Player *${playerName}* not found.` });
    }

    const userId = msg.key.participant || msg.key.remoteJid;
    const wallet = memory.getWallet(userId);

    if (wallet < card.price) {
      return sock.sendMessage(msg.key.remoteJid, { text: `💸 Not enough coins! You have ${wallet}, but need ${card.price}.` });
    }

    // Deduct coins and add card
    memory.setWallet(userId, wallet - card.price);
    memory.addCard(userId, card.name);

    sock.sendMessage(msg.key.remoteJid, {
      image: { url: card.image },
      caption: `✅ You bought *${card.name}*!\n💰 -${card.price} coins | ⭐ ${card.rarity}`
    });
  },

  // View your owned cards
  mycards(sock, msg) {
    const userId = msg.key.participant || msg.key.remoteJid;
    const cards = memory.getCards(userId);

    if (cards.length === 0) {
      return sock.sendMessage(msg.key.remoteJid, { text: "📦 You don't own any FIFA cards yet. Buy some with .fifashop!" });
    }

    let cardText = `🎴 *Your FIFA Cards:*\n\n`;
    cards.forEach(c => {
      cardText += `• ${c}\n`;
    });

    sock.sendMessage(msg.key.remoteJid, { text: cardText });
  }
};