// 📦 LiamBot Fun Commands (Upgraded)

// Utility helper: sleep const wait = ms => new Promise(r => setTimeout(r, ms));

/**

Send multiple interactive typing messages for effect.

@param {*} sock WhatsApp sock instance

@param {*} chatId chat ID

@param {*} steps Array of text messages to send one after another with delay

@param {*} delay delay between steps (ms) */ async function interactiveSteps(sock, chatId, steps, delay = 600) { for (const step of steps) { await sock.sendMessage(chatId, { text: step }); await wait(delay); } }


export async function genie(sock, msg, args) { const chatId = msg.key.remoteJid; if (!args.length) { return sock.sendMessage(chatId, { text: "🧞‍♂️ Oops! You forgot to ask your wish.\nUsage: .genie Will I become famous?" }); }

const steps = [ "🧞‍♂️ Summoning the genie...", "✨ Opening the magic lamp...", "🔮 Reading your fortune...", "🌠 Whispering to the stars..." ];

const responses = [ "Yes!", "No!", "Maybe.", "Ask again later.", "Definitely!", "I don't think so.", "Absolutely not.", "Without a doubt.", "Very unlikely.", "Signs point to yes!" ];

await interactiveSteps(sock, chatId, steps);

const reply = responses[Math.floor(Math.random() * responses.length)]; await sock.sendMessage(chatId, { text: 🧞‍♂️ *Genie says:* ${reply} }); }

export async function joke(sock, msg) { const chatId = msg.key.remoteJid; const steps = [ "🤣 Let me think of a good one...", "🤔 Hmm...", "😆 You're going to love this...", "🎭 Loading joke script..." ]; await interactiveSteps(sock, chatId, steps); const jokes = [ "Why don’t skeletons fight each other? They don’t have the guts!", "Parallel lines have so much in common. It’s a shame they’ll never meet.", "Why can’t your nose be 12 inches long? Because then it would be a foot!" ]; const joke = jokes[Math.floor(Math.random() * jokes.length)]; await sock.sendMessage(chatId, { text: 😂 Here's one for you:\n\n${joke} }); }

export async function meme(sock, msg) { const chatId = msg.key.remoteJid; const steps = [ "🖼️ Searching the meme archives...", "📡 Downloading fresh meme...", "🎞️ Loading image...", "🤣 You're gonna laugh!" ]; await interactiveSteps(sock, chatId, steps);

const memes = [ "https://i.imgflip.com/30b1gx.jpg", "https://i.redd.it/a0v87gwzoge61.jpg", "https://i.imgflip.com/2wifvo.jpg", "https://i.imgflip.com/26am.jpg" ]; const memeUrl = memes[Math.floor(Math.random() * memes.length)]; await sock.sendMessage(chatId, { image: { url: memeUrl }, caption: "🤣 Hope this meme makes your day!" }); }

export async function fact(sock, msg) { const chatId = msg.key.remoteJid; const steps = [ "📚 Opening the encyclopedia...", "🔍 Looking for a fun fact...", "🧠 Activating brain mode...", "💡 Got something interesting!" ]; await interactiveSteps(sock, chatId, steps);

const facts = [ "A day on Venus is longer than a year on Venus.", "Sloths can hold their breath longer than dolphins.", "The Eiffel Tower can grow more than 6 inches in summer." ]; const fact = facts[Math.floor(Math.random() * facts.length)]; await sock.sendMessage(chatId, { text: 📖 *Did you know?* ${fact} }); }

export async function say(sock, msg, args) { const chatId = msg.key.remoteJid; if (!args.length) { return sock.sendMessage(chatId, { text: "🔊 Usage: .say [your message here]\nPlease provide a message to say!" }); } const modes = [ text => text.toUpperCase(), text => text.toLowerCase(), text => ✨ *${text}* ✨, text => text.split('').join(' '), text => 🌀 ${text.split('').reverse().join('')} 🌀 ]; const mode = modes[Math.floor(Math.random() * modes.length)]; const funText = mode(args.join(" ")); await sock.sendMessage(chatId, { text: funText }); }

export async function echo(sock, msg, args) { const chatId = msg.key.remoteJid; if (!args.length) { return sock.sendMessage(chatId, { text: "🗣️ Usage: .echo [your message here]\nYou need to tell me what to echo!" }); } const responses = [ text => 📢 ${text} 📢, text => ➡️ ${text} ⬅️, text => 🔊 Listen: *${text}*, text => 💬 \"${text}\", text => 🎤 Echooo... ${text} ...${text} ]; const chosen = responses[Math.floor(Math.random() * responses.length)](args.join(" ")); await sock.sendMessage(chatId, { text: chosen }); }

export async function flip(sock, msg) { const chatId = msg.key.remoteJid; await sock.sendMessage(chatId, { text: "🪙 Flipping the coin now..." }); await wait(1500); const result = Math.random() < 0.5 ? "Heads" : "Tails"; await sock.sendMessage(chatId, { text: 🪙 The coin landed on *${result}*! }); }

export async function roll(sock, msg) { const chatId = msg.key.remoteJid; await sock.sendMessage(chatId, { text: "🎲 Rolling the dice for you..." }); await wait(1200); const number = Math.floor(Math.random() * 6) + 1; await sock.sendMessage(chatId, { text: 🎲 You rolled a *${number}*! }); }

export async function random(sock, msg, args) { const chatId = msg.key.remoteJid; if (args.length < 2) { return sock.sendMessage(chatId, { text: "🤔 Usage: .random option1 option2 ...\nPlease provide at least two options!" }); } await sock.sendMessage(chatId, { text: "🤹 Let me randomly pick one for you..." }); await wait(600); const chosen = args[Math.floor(Math.random() * args.length)]; await sock.sendMessage(chatId, { text: 🎯 I choose: *${chosen}* }); }

