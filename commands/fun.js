// 📦 LiamBot Fun Commands
export async function eightball(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  if (!args.length) {
    return sock.sendMessage(chatId, { text: "🎱 Ask me a question like `.8ball Will I get rich?`" });
  }

  const steps = [
    "🎱 Shaking the magic ball...",
    "🔮 Concentrating...",
    "💭 Thinking deeply...",
  ];

  const responses = [
    "Yes!", "No!", "Maybe.", "Ask again later.", "Definitely!", "I don't think so.",
    "Absolutely not.", "Without a doubt.", "Very unlikely.", "Signs point to yes!"
  ];
  for (const step of steps) {
    await sock.sendMessage(chatId, { text: step });
    await new Promise(r => setTimeout(r, 600));
  }

  const reply = responses[Math.floor(Math.random() * responses.length)];
  await sock.sendMessage(chatId, { text: `🎱 *Answer:* ${reply}` });
}

export async function joke(sock, msg) {
  const chatId = msg.key.remoteJid;
  const jokes = [
    "Why don’t skeletons fight each other? They don’t have the guts!",
    "Parallel lines have so much in common. It’s a shame they’ll never meet.",
    "Why can’t your nose be 12 inches long? Because then it would be a foot!"
  ];
  await sock.sendMessage(chatId, { text: "🤣 Here's a joke coming up..." });
  await new Promise(r => setTimeout(r, 800));
  await sock.sendMessage(chatId, { text: `😂 ${jokes[Math.floor(Math.random() * jokes.length)]}` });
}

export async function meme(sock, msg) {
  const chatId = msg.key.remoteJid;
  const memes = [
    "https://i.imgflip.com/30b1gx.jpg",
    "https://i.redd.it/a0v87gwzoge61.jpg",
    "https://i.imgflip.com/2wifvo.jpg",
    "https://i.imgflip.com/26am.jpg",
  ];
  await sock.sendMessage(chatId, { text: "🖼️ Fetching a meme..." });
  await new Promise(r => setTimeout(r, 700));
  await sock.sendMessage(chatId, {
    image: { url: memes[Math.floor(Math.random() * memes.length)] },
    caption: "🤣 Here's a meme for you!"
  });
}

export async function fact(sock, msg) {
  const chatId = msg.key.remoteJid;
  const facts = [
    "A day on Venus is longer than a year on Venus.",
    "Sloths can hold their breath longer than dolphins.",
    "The Eiffel Tower can grow more than 6 inches in summer."
  ];
  await sock.sendMessage(chatId, { text: `📚 Did you know? ${facts[Math.floor(Math.random() * facts.length)]}` });
}

export async function trivia(sock, msg) {
  const chatId = msg.key.remoteJid;
  const trivias = [
    "🧠 Q: What’s the smallest bone in the human body?\n👉 A: The stapes (in the ear).",
    "🧠 Q: Who painted the Mona Lisa?\n👉 A: Leonardo da Vinci.",
    "🧠 Q: Which planet has the most moons?\n👉 A: Saturn!"
  ];
  await sock.sendMessage(chatId, { text: trivias[Math.floor(Math.random() * trivias.length)] });
}

export async function riddle(sock, msg) {
  const chatId = msg.key.remoteJid;
  const riddles = [
    "*Riddle:* What comes once in a minute, twice in a moment, but never in a thousand years?\n💡 *Answer:* The letter M.",
    "*Riddle:* What can travel around the world while staying in the same corner?\n💡 *Answer:* A stamp.",
    "*Riddle:* The more of me you take, the more you leave behind. What am I?\n💡 *Answer:* Footsteps."
  ];
  await sock.sendMessage(chatId, { text: riddles[Math.floor(Math.random() * riddles.length)] });
}

export async function quote(sock, msg) {
  const chatId = msg.key.remoteJid;
  const quotes = [
    "💬 “Be yourself; everyone else is already taken.” — Oscar Wilde",
    "💬 “Do or do not. There is no try.” — Yoda",
    "💬 “Stay hungry, stay foolish.” — Steve Jobs"
  ];
  await sock.sendMessage(chatId, { text: quotes[Math.floor(Math.random() * quotes.length)] });
}

export async function fortune(sock, msg) {
  const chatId = msg.key.remoteJid;
  const fortunes = [
    "🌟 You will soon receive unexpected good news.",
    "✨ Your talents will be recognized and rewarded.",
    "💫 Something lost will soon be found."
  ];
  await sock.sendMessage(chatId, { text: fortunes[Math.floor(Math.random() * fortunes.length)] });
}

export async function compliment(sock, msg) {
  const chatId = msg.key.remoteJid;
  const compliments = [
    "🌈 You’re more amazing than you realize.",
    "🌟 You have a great sense of humor!",
    "🌻 You’re like a ray of sunshine!"
  ];
  await sock.sendMessage(chatId, { text: compliments[Math.floor(Math.random() * compliments.length)] });
}

export async function insult(sock, msg) {
  const chatId = msg.key.remoteJid;
  const insults = [
    "😈 You bring everyone so much joy... when you leave the room.",
    "😜 If I had a dollar for every smart thing you said, I’d be broke.",
    "🧠 Your secrets are always safe with me. I never even listen."
  ];
  await sock.sendMessage(chatId, { text: insults[Math.floor(Math.random() * insults.length)] });
}

export async function say(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  if (!args.length) return sock.sendMessage(chatId, { text: "🔊 Usage: `.say [message]`" });
  await sock.sendMessage(chatId, { text: args.join(" ") });
}

export async function echo(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  if (!args.length) return sock.sendMessage(chatId, { text: "🗣️ Usage: `.echo [message]`" });
  await sock.sendMessage(chatId, { text: `📢 ${args.join(" ")}` });
}

export async function flip(sock, msg) {
  const chatId = msg.key.remoteJid;
  const result = Math.random() < 0.5 ? "Heads" : "Tails";
  await sock.sendMessage(chatId, { text: "🪙 Flipping..." });
  await new Promise(r => setTimeout(r, 800));
  await sock.sendMessage(chatId, { text: `🪙 It's *${result}*!` });
}

export async function roll(sock, msg) {
  const chatId = msg.key.remoteJid;
  const number = Math.floor(Math.random() * 6) + 1;
  await sock.sendMessage(chatId, { text: "🎲 Rolling the dice..." });
  await new Promise(r => setTimeout(r, 700));
  await sock.sendMessage(chatId, { text: `🎲 You rolled a *${number}*!` });
}

export async function random(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  if (args.length < 2) {
    return sock.sendMessage(chatId, { text: "🤔 Usage: `.random option1 option2 ...`" });
  }
  await sock.sendMessage(chatId, { text: "🤹 Picking randomly..." });
  await new Promise(r => setTimeout(r, 600));
  const randomItem = args[Math.floor(Math.random() * args.length)];
  await sock.sendMessage(chatId, { text: `🎯 I choose: *${randomItem}*` });
}