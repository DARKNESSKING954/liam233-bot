// commands/fun.js
// 📦 LiamBot Fun Commands

export async function eightball(sock, msg, args) {
  const responses = [
    "Yes!", "No!", "Maybe.", "Ask again later.", "Definitely!", "I don't think so."
  ];
  const reply = responses[Math.floor(Math.random() * responses.length)];
  await sock.sendMessage(msg.key.remoteJid, { text: `🎱 ${reply}` });
}

export async function joke(sock, msg) {
  const jokes = [
    "Why did the scarecrow win an award? Because he was outstanding in his field.",
    "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    "Why don't scientists trust atoms? Because they make up everything!"
  ];
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  await sock.sendMessage(msg.key.remoteJid, { text: `😂 ${joke}` });
}

export async function meme(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: "🔥 Here's a meme: https://i.imgflip.com/4/30b1gx.jpg" });
}

export async function fact(sock, msg) {
  const facts = [
    "Honey never spoils.",
    "Bananas are berries, but strawberries aren't.",
    "Octopuses have three hearts."
  ];
  const fact = facts[Math.floor(Math.random() * facts.length)];
  await sock.sendMessage(msg.key.remoteJid, { text: `📚 Fact: ${fact}` });
}

export async function trivia(sock, msg) {
  const trivias = [
    "Which planet is closest to the sun? Mercury.",
    "What is the capital of Japan? Tokyo.",
    "Who wrote 'Romeo and Juliet'? William Shakespeare."
  ];
  const trivia = trivias[Math.floor(Math.random() * trivias.length)];
  await sock.sendMessage(msg.key.remoteJid, { text: `🧠 Trivia: ${trivia}` });
}

export async function riddle(sock, msg) {
  const riddles = [
    "What has to be broken before you can use it? An egg.",
    "I’m tall when I’m young, and I’m short when I’m old. What am I? A candle.",
    "What month of the year has 28 days? All of them."
  ];
  const riddle = riddles[Math.floor(Math.random() * riddles.length)];
  await sock.sendMessage(msg.key.remoteJid, { text: `🧩 Riddle: ${riddle}` });
}

export async function quote(sock, msg) {
  const quotes = [
    "“Be yourself; everyone else is already taken.” — Oscar Wilde",
    "“In the middle of every difficulty lies opportunity.” — Albert Einstein",
    "“It always seems impossible until it’s done.” — Nelson Mandela"
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  await sock.sendMessage(msg.key.remoteJid, { text: `💬 Quote: ${quote}` });
}

export async function fortune(sock, msg) {
  const fortunes = [
    "A beautiful, smart, and loving person will be coming into your life.",
    "Adventure can be real happiness.",
    "You will discover a hidden talent."
  ];
  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  await sock.sendMessage(msg.key.remoteJid, { text: `🔮 Fortune: ${fortune}` });
}

export async function compliment(sock, msg) {
  const compliments = [
    "You're like sunshine on a rainy day.",
    "Your smile can light up a room.",
    "You're a true star!"
  ];
  const compliment = compliments[Math.floor(Math.random() * compliments.length)];
  await sock.sendMessage(msg.key.remoteJid, { text: `😊 ${compliment}` });
}

export async function insult(sock, msg) {
  const insults = [
    "You're as sharp as a marble.",
    "You have something on your chin… no, the third one down.",
    "You're not stupid; you just have bad luck thinking."
  ];
  const insult = insults[Math.floor(Math.random() * insults.length)];
  await sock.sendMessage(msg.key.remoteJid, { text: `😈 ${insult}` });
}

export async function say(sock, msg, args) {
  if (!args.length) {
    return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .say [message]" });
  }
  const message = args.join(" ");
  await sock.sendMessage(msg.key.remoteJid, { text: message });
}

export async function echo(sock, msg, args) {
  if (!args.length) {
    return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .echo [message]" });
  }
  const message = args.join(" ");
  await sock.sendMessage(msg.key.remoteJid, { text: `📢 ${message}` });
}

export async function flip(sock, msg) {
  const result = Math.random() < 0.5 ? "Heads" : "Tails";
  await sock.sendMessage(msg.key.remoteJid, { text: `🪙 It's *${result}*!` });
}

export async function roll(sock, msg) {
  const number = Math.floor(Math.random() * 6) + 1;
  await sock.sendMessage(msg.key.remoteJid, { text: `🎲 You rolled a *${number}*.` });
}

export async function random(sock, msg, args) {
  if (args.length < 2) {
    return sock.sendMessage(msg.key.remoteJid, { text: "Usage: .random [option1] [option2] ..." });
  }
  const randomItem = args[Math.floor(Math.random() * args.length)];
  await sock.sendMessage(msg.key.remoteJid, { text: `🎲 Random choice: *${randomItem}*` });
}