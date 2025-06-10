// index.js
// 📱 LiamBot WhatsApp bot core — command loader and message handler

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');

// 📦 Command storage
const commands = {};

// 🔄 Dynamically load all command modules from /commands folder
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = path.join(__dirname, 'commands', file);
  const commandModule = require(filePath);

  // Store all exported functions as commands
  for (const [commandName, commandFunc] of Object.entries(commandModule)) {
    commands[commandName.toLowerCase()] = commandFunc;
  }
}

console.log(`✅ Loaded ${Object.keys(commands).length} commands.`);

// 📞 Initialize WhatsApp socket connection with Baileys
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth'); // Auth folder
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  // 🔄 Save credentials on update
  sock.ev.on('creds.update', saveCreds);

  // 📩 Handle incoming messages
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    // 📦 Get text message body
    const from = msg.key.remoteJid;
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      "";

    // 📏 Command prefix
    const prefix = '.';
    if (!body.startsWith(prefix)) return;

    // 📝 Parse command and arguments
    const args = body.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // ⚙️ Check if command exists
    if (commands[commandName]) {
      try {
        // 🏃 Execute command function
        await commands[commandName](sock, msg, args);
      } catch (err) {
        console.error(`❌ Error running command ${commandName}:`, err);
        sock.sendMessage(from, { text: `❌ Error running command: ${commandName}` });
      }
    }
  });
}

// 📡 Launch the bot
startBot();