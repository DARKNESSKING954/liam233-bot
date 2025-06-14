// 📦 LiamBot Fun Commands (Upgraded)

const wait = ms => new Promise(r => setTimeout(r, ms));

// 📢 Typing animation with steps
async function interactiveSteps(sock, chatId, steps, delay = 600) {
  for (const step of steps) {
    await sock.sendMessage(chatId, { text: step });
    await wait(delay);
  }
}

// 🤣 Joke command
export async function joke(sock, msg) {
  const chatId = msg.key.remoteJid;
  const steps = [
    "🤣 Let me think of a good one...",
    "💭 Recalling my funniest files...",
    "📡 Downloading giggles...",
    "😂 Ready? Here it comes..."
  ];
  const jokes = [
    "Why don’t skeletons fight each other? They don’t have the guts!",
    "Parallel lines have so much in common. It’s a shame they’ll never meet.",
    "Why can’t your nose be 12 inches long? Because then it would be a foot!",
    "What did the ocean say to the beach? Nothing, it just waved.",
    "Why did the math book look sad? Because it had too many problems.",
    "I told my computer I needed a break, and it said 'No problem, I’ll crash.'"
  ];
  await interactiveSteps(sock, chatId, steps);
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  await sock.sendMessage(chatId, { text: `😂 Here's one:\n\n${joke}` });
}

// 📚 Fun facts
export async function fact(sock, msg) {
  const chatId = msg.key.remoteJid;
  const steps = [
    "📚 Scanning the universe for facts...",
    "🔍 Filtering fun from boring...",
    "📖 Flipping fact files...",
    "🧠 Got one!"
  ];
  const facts = [
    "A day on Venus is longer than a year on Venus.",
    "Sloths can hold their breath longer than dolphins.",
    "Bananas are berries, but strawberries aren't.",
    "Octopuses have three hearts.",
    "The Eiffel Tower can grow over 6 inches in summer.",
    "Honey never spoils—you could eat 3,000-year-old honey!"
  ];
  await interactiveSteps(sock, chatId, steps);
  const fact = facts[Math.floor(Math.random() * facts.length)];
  await sock.sendMessage(chatId, { text: `📖 Did you know?\n${fact}` });
}

// 🧠 Trivia
const pendingTrivia = new Map();

export async function trivia(sock, msg) {
  const chatId = msg.key.remoteJid;
  const steps = [
    "🧠 Let me find a smart one...",
    "📚 Opening trivia vault...",
    "🤓 Calibrating difficulty...",
    "📢 Ready!"
  ];
  const triviaQuestions = [
    { question: "What’s the smallest bone in the human body?", answer: "stapes" },
    { question: "Who painted the Mona Lisa?", answer: "leonardo da vinci" },
    { question: "Which planet has the most moons?", answer: "saturn" },
    { question: "What is the capital of Japan?", answer: "tokyo" },
    { question: "How many continents are there?", answer: "7" }
  ];

  if (pendingTrivia.has(chatId)) {
    return sock.sendMessage(chatId, { text: "❗ You still have an unanswered trivia question! Please answer it first." });
  }

  const q = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
  pendingTrivia.set(chatId, { answer: q.answer.toLowerCase(), askedAt: Date.now() });

  await interactiveSteps(sock, chatId, steps);
  await sock.sendMessage(chatId, {
    text: `${q.question}\n\nReply with your answer within *20 seconds*!`
  });

  setTimeout(async () => {
    if (pendingTrivia.has(chatId)) {
      await sock.sendMessage(chatId, {
        text: `⌛ Time's up! The correct answer was:\n*${q.answer}*`
      });
      pendingTrivia.delete(chatId);
    }
  }, 20000);
}

export async function handleTriviaAnswer(sock, msg) {
  const chatId = msg.key.remoteJid;
  if (!pendingTrivia.has(chatId)) return false;

  const userAnswer = (msg.message?.conversation || "").toLowerCase().trim();
  const correctAnswer = pendingTrivia.get(chatId).answer;

  if (!userAnswer) return false;

  if (userAnswer.includes(correctAnswer)) {
    await sock.sendMessage(chatId, { text: "🎉 Correct! Well done!\nTry another with .trivia" });
  } else {
    await sock.sendMessage(chatId, {
      text: `❌ Wrong! The correct answer was:\n*${correctAnswer}*\nTry again with .trivia`
    });
  }
  pendingTrivia.delete(chatId);
  return true;
}

// 🧩 Riddle
const riddles = [
  { riddle: "What comes once in a minute, twice in a moment, but never in a thousand years?", answer: "The letter M" },
  { riddle: "What can travel around the world while staying in the same corner?", answer: "A stamp" },
  { riddle: "The more of me you take, the more you leave behind. What am I?", answer: "Footsteps" },
  { riddle: "What has keys but can't open locks?", answer: "A piano" }
];

export async function riddle(sock, msg) {
  const chatId = msg.key.remoteJid;
  const r = riddles[Math.floor(Math.random() * riddles.length)];
  const steps = [
    "🧩 Fetching a riddle...",
    "💭 Thinking...",
    "🔐 Locking the answer...",
    "🤔 Here it is!"
  ];
  await interactiveSteps(sock, chatId, steps);
  await sock.sendMessage(chatId, { text: `🧩 Riddle:\n${r.riddle}\n\nYou have 20 seconds to answer!` });
  setTimeout(async () => {
    await sock.sendMessage(chatId, { text: `💡 Answer: *${r.answer}*` });
  }, 20000);
}

// Shared animated responder
async function sendRandomWithSteps(sock, chatId, items, intro, emoji) {
  const steps = [
    `${emoji} ${intro}`,
    "⏳ Loading options...",
    "🎯 Picking the best one...",
    "✅ Done!"
  ];
  await interactiveSteps(sock, chatId, steps);
  const item = items[Math.floor(Math.random() * items.length)];
  await sock.sendMessage(chatId, { text: item });
}

// 📝 Quote
export async function quote(sock, msg) {
  const chatId = msg.key.remoteJid;
  const quotes = [
    "“Be yourself; everyone else is already taken.” — Oscar Wilde",
    "“Do or do not. There is no try.” — Yoda",
    "“Stay hungry, stay foolish.” — Steve Jobs",
    "“In the middle of difficulty lies opportunity.” — Einstein"
  ];
  await sendRandomWithSteps(sock, chatId, quotes, "Fetching a motivational quote...", "📝");
}

// 🔮 Fortune
export async function fortune(sock, msg) {
  const chatId = msg.key.remoteJid;
  const fortunes = [
    "🌟 You will soon receive unexpected good news.",
    "✨ Your talents will be recognized and rewarded.",
    "💫 Something lost will soon be found.",
    "🔮 Big opportunities are coming your way."
  ];
  await sendRandomWithSteps(sock, chatId, fortunes, "Reading your fortune...", "🔮");
}

// 😊 Compliment
export async function compliment(sock, msg) {
  const chatId = msg.key.remoteJid;
  const compliments = [
    "You're more amazing than you realize.",
    "You have a great sense of humor!",
    "You’re like a ray of sunshine!",
    "You make the world better by being in it."
  ];
  await sendRandomWithSteps(sock, chatId, compliments, "Giving you a compliment...", "😊");
}

// 😈 Insult
export async function insult(sock, msg) {
  const chatId = msg.key.remoteJid;
  const insults = [
    "You bring everyone so much joy... when you leave the room.",
    "If I had a dollar for every smart thing you said, I’d be broke.",
    "You have something on your chin... no, the third one down.",
    "You’re not stupid; you just have bad luck thinking."
  ];
  await sendRandomWithSteps(sock, chatId, insults, "Here's a playful roast...", "😈");
}

// 🔊 Say
export async function say(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  if (!args.length) {
    return sock.sendMessage(chatId, { text: "🔊 Usage: .say your message here" });
  }

  const modes = [
    text => text.toUpperCase(),
    text => text.toLowerCase(),
    text => `✨ ${text} ✨`,
    text => text.split('').join(' ')
  ];

  const mode = modes[Math.floor(Math.random() * modes.length)];
  const funText = mode(args.join(" "));
  await sock.sendMessage(chatId, { text: funText });
}

// 🗣️ Echo
export async function echo(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  if (!args.length) {
    return sock.sendMessage(chatId, { text: "🗣️ Usage: .echo [your message]" });
  }

  const formats = [
    text => `📢 ${text} 📢`,
    text => `➡️ ${text} ⬅️`,
    text => `🔊 Listen carefully: ${text}`,
    text => `💬 “${text}”`
  ];

  const reply = formats[Math.floor(Math.random() * formats.length)](args.join(" "));
  await sock.sendMessage(chatId, { text: reply });
}

// 🪙 Flip
export async function flip(sock, msg) {
  const chatId = msg.key.remoteJid;
  const steps = [
    "🪙 Tossing the coin...",
    "🌀 It's in the air...",
    "📉 Almost landing...",
    "🎯 Done!"
  ];
  await interactiveSteps(sock, chatId, steps);
  const result = Math.random() < 0.5 ? "Heads" : "Tails";
  await sock.sendMessage(chatId, { text: `🪙 Result: *${result}*` });
}

// 🎲 Roll
export async function roll(sock, msg) {
  const chatId = msg.key.remoteJid;
  const steps = [
    "🎲 Rolling the dice...",
    "🔁 Shuffling sides...",
    "🎯 Checking number...",
    "🎉 Here's your roll!"
  ];
  await interactiveSteps(sock, chatId, steps);
  const number = Math.floor(Math.random() * 6) + 1;
  await sock.sendMessage(chatId, { text: `🎲 You rolled a *${number}*!` });
}

// 🎯 Random
export async function random(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  if (args.length < 2) {
    return sock.sendMessage(chatId, { text: "🤔 Usage: .random option1 option2 ..." });
  }

  const steps = [
    "🎰 Analyzing options...",
    "🔍 Considering all outcomes...",
    "🎯 Targeting the best...",
    "🎉 Got one!"
  ];
  await interactiveSteps(sock, chatId, steps);
  const chosen = args[Math.floor(Math.random() * args.length)];
  await sock.sendMessage(chatId, { text: `🎯 I choose: *${chosen}*` });
}