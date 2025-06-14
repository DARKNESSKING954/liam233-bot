// 📦 LiamBot Fun Commands (Upgraded)

const wait = ms => new Promise(r => setTimeout(r, ms));

// 🧠 Typing animation with steps async function interactiveSteps(sock, chatId, steps, delay = 600) { for (const step of steps) { await sock.sendMessage(chatId, { text: step }); await wait(delay); } }

// 🎱 Magic 8-Ball export async function eightball(sock, msg, args) { const chatId = msg.key.remoteJid; if (!args.length) { return sock.sendMessage(chatId, { text: "🎱 Oops! You forgot to ask a question.\nUsage: .8ball Will I get rich?" }); }

const steps = [ "🎱 Shaking the magic 8-ball...", "🔮 Concentrating the energies...", "💭 Thinking deeply about your future..." ];

const responses = [ "Yes!", "No!", "Maybe.", "Ask again later.", "Definitely!", "I don't think so.", "Absolutely not.", "Without a doubt.", "Very unlikely.", "Signs point to yes!", "Outlook good.", "Don't count on it.", "You may rely on it.", "My sources say no.", "Reply hazy, try again." ];

await interactiveSteps(sock, chatId, steps); const reply = responses.splice(Math.floor(Math.random() * responses.length), 1)[0]; await sock.sendMessage(chatId, { text: 🎱 Answer: ${reply} }); }

// 🤣 Joke command export async function joke(sock, msg) { const chatId = msg.key.remoteJid; const jokes = [ "Why don’t skeletons fight each other? They don’t have the guts!", "Parallel lines have so much in common. It’s a shame they’ll never meet.", "Why can’t your nose be 12 inches long? Because then it would be a foot!", "What did the ocean say to the beach? Nothing, it just waved.", "Why did the math book look sad? Because it had too many problems." ];

await sock.sendMessage(chatId, { text: "🤣 Let me think of a good joke..." }); await wait(1000); const joke = jokes.splice(Math.floor(Math.random() * jokes.length), 1)[0]; await sock.sendMessage(chatId, { text: 😂 Here's one for you:\n\n${joke} }); }

// 📚 Fun facts export async function fact(sock, msg) { const chatId = msg.key.remoteJid; const facts = [ "A day on Venus is longer than a year on Venus.", "Sloths can hold their breath longer than dolphins.", "The Eiffel Tower can grow more than 6 inches in summer.", "Octopuses have three hearts.", "Bananas are berries, but strawberries are not." ];

await sock.sendMessage(chatId, { text: "📚 Fetching a fun fact for you..." }); await wait(700); const fact = facts.splice(Math.floor(Math.random() * facts.length), 1)[0]; await sock.sendMessage(chatId, { text: 📖 Did you know? ${fact} }); }

// 🧠 Trivia const pendingTrivia = new Map();

export async function trivia(sock, msg) { const chatId = msg.key.remoteJid; const triviaQuestions = [ { question: "🧠 What’s the smallest bone in the human body?", answer: "The stapes" }, { question: "🧠 Who painted the Mona Lisa?", answer: "Leonardo da Vinci" }, { question: "🧠 Which planet has the most moons?", answer: "Saturn" }, { question: "🧠 What is the capital of Japan?", answer: "Tokyo" }, { question: "🧠 How many continents are there?", answer: "7" } ];

if (pendingTrivia.has(chatId)) { return sock.sendMessage(chatId, { text: "❗ You still have an unanswered trivia question! Please answer it first." }); }

const q = triviaQuestions.splice(Math.floor(Math.random() * triviaQuestions.length), 1)[0]; pendingTrivia.set(chatId, { answer: q.answer.toLowerCase(), askedAt: Date.now() });

await sock.sendMessage(chatId, { text: ${q.question}\n\nReply with your answer within 30 seconds! });

setTimeout(async () => { if (pendingTrivia.has(chatId)) { await sock.sendMessage(chatId, { text: ⌛ Time's up! The correct answer was:\n*${q.answer}*\nTry another trivia by typing .trivia }); pendingTrivia.delete(chatId); } }, 30000); }

export async function handleTriviaAnswer(sock, msg) { const chatId = msg.key.remoteJid; if (!pendingTrivia.has(chatId)) return false;

const userAnswer = (msg.message?.conversation || "").toLowerCase().trim(); const correctAnswer = pendingTrivia.get(chatId).answer;

if (!userAnswer) return false;

if (userAnswer.includes(correctAnswer)) { await sock.sendMessage(chatId, { text: "🎉 Correct! You nailed it! Great job!\nWant more? Type .trivia" }); } else { await sock.sendMessage(chatId, { text: ❌ Nope, that's not right. The correct answer was:\n*${correctAnswer}*\nTry again with .trivia }); } pendingTrivia.delete(chatId); return true; }

// 🧩 Riddles const riddles = [ { riddle: "What comes once in a minute, twice in a moment, but never in a thousand years?", answer: "The letter M" }, { riddle: "What can travel around the world while staying in the same corner?", answer: "A stamp" }, { riddle: "The more of me you take, the more you leave behind. What am I?", answer: "Footsteps" } ];

export async function riddle(sock, msg) { const chatId = msg.key.remoteJid; const r = riddles.splice(Math.floor(Math.random() * riddles.length), 1)[0]; await sock.sendMessage(chatId, { text: 🧩 Riddle: ${r.riddle}\n\nReply with your guess! }); setTimeout(async () => { await sock.sendMessage(chatId, { text: 💡 Answer: ${r.answer} }); }, 20000); }

// Shared pattern async function sendRandomWithSteps(sock, chatId, items, intro, emoji) { await sock.sendMessage(chatId, { text: ${emoji} ${intro} }); await wait(800); const item = items.splice(Math.floor(Math.random() * items.length), 1)[0]; await sock.sendMessage(chatId, { text: item }); }

export async function quote(sock, msg) { const chatId = msg.key.remoteJid; const quotes = [ "💬 “Be yourself; everyone else is already taken.” — Oscar Wilde", "💬 “Do or do not. There is no try.” — Yoda", "💬 “Stay hungry, stay foolish.” — Steve Jobs" ]; await sendRandomWithSteps(sock, chatId, quotes, "Here's a motivational quote for you...", "📝"); }

export async function fortune(sock, msg) { const chatId = msg.key.remoteJid; const fortunes = [ "🌟 You will soon receive unexpected good news.", "✨ Your talents will be recognized and rewarded.", "💫 Something lost will soon be found." ]; await sendRandomWithSteps(sock, chatId, fortunes, "Reading your fortune...", "🔮"); }

export async function compliment(sock, msg) { const chatId = msg.key.remoteJid; const compliments = [ "🌈 You’re more amazing than you realize.", "🌟 You have a great sense of humor!", "🌻 You’re like a ray of sunshine!" ]; await sendRandomWithSteps(sock, chatId, compliments, "Here's a compliment just for you...", "😊"); }

export async function insult(sock, msg) { const chatId = msg.key.remoteJid; const insults = [ "😈 You bring everyone so much joy... when you leave the room.", "😜 If I had a dollar for every smart thing you said, I’d be broke.", "🧠 Your secrets are always safe with me. I never even listen." ]; await sendRandomWithSteps(sock, chatId, insults, "Here's a playful insult for you...", "😈"); }

export async function say(sock, msg, args) { const chatId = msg.key.remoteJid; if (!args.length) { return sock.sendMessage(chatId, { text: "🔊 Usage: .say [your message here]\nExample: .say Hello, world!\nPlease provide a message to say!" }); }

const modes = [ text => text.toUpperCase(), text => text.toLowerCase(), text => ✨ ${text} ✨, text => text.split('').join(' ') ];

const mode = modes[Math.floor(Math.random() * modes.length)]; const funText = mode(args.join(" ")); await sock.sendMessage(chatId, { text: funText }); }

export async function echo(sock, msg, args) { const chatId = msg.key.remoteJid; if (!args.length) { return sock.sendMessage(chatId, { text: "🗣️ Usage: .echo [your message here]\nExample: .echo Repeat after me!\nYou need to tell me what to echo!" }); }

const responses = [ text => 📢 ${text} 📢, text => ➡️ ${text} ⬅️, text => 🔊 Listen carefully: ${text}, text => 💬 \"${text}\" ]; const chosen = responses[Math.floor(Math.random() * responses.length)](args.join(" ")); await sock.sendMessage(chatId, { text: chosen }); }

export async function flip(sock, msg) { const chatId = msg.key.remoteJid; await sock.sendMessage(chatId, { text: "🪙 Flipping the coin now..." }); await wait(1500); const result = Math.random() < 0.5 ? "Heads" : "Tails"; await sock.sendMessage(chatId, { text: 🪙 The coin landed on ${result}! Try again with .flip }); }

export async function roll(sock, msg) { const chatId = msg.key.remoteJid; await sock.sendMessage(chatId, { text: "🎲 Rolling the dice for you..." }); await wait(1200); const number = Math.floor(Math.random() * 6) + 1; await sock.sendMessage(chatId, { text: 🎲 You rolled a ${number}! Want to roll again? Use .roll }); }

export async function random(sock, msg, args) { const chatId = msg.key.remoteJid; if (args.length < 2) { return sock.sendMessage(chatId, { text: "🤔 Usage: .random option1 option2 ...\nPlease provide at least two options to pick from!" }); }

await sock.sendMessage(chatId, { text: "🤹 Let me randomly pick one for you..." }); await wait(600); const chosen = args[Math.floor(Math.random() * args.length)]; await sock.sendMessage(chatId, { text: 🎯 I choose: ${chosen} }); }

