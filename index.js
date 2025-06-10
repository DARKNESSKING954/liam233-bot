const { default: makeWASocket, useMultiFileAuthState } = require('@adiwajshing/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

// 📦 Command storage
const commands = {};

// Load commands
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const commandModule = require(path.join(__dirname, 'commands', file));
  for (const [commandName, commandFunc] of Object.entries(commandModule)) {
    commands[commandName.toLowerCase()] = commandFunc;
  }
}
console.log(`✅ Loaded ${Object.keys(commands).length} commands.`);

// 📞 Start WhatsApp socket connection
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    auth: state
  });

  // Save creds when updated
  sock.ev.on('creds.update', saveCreds);

  // Handle connection updates
  sock.ev.on('connection.update', async (update) => {
    console.log('📡 Connection update:', update);  // <-- log raw update to debug

    const { connection, qr } = update;

    if (qr) {
      try {
        console.log('Scan this QR code:');
        console.log(await QRCode.toString(qr, { type: 'terminal' }));
      } catch (e) {
        console.error('QR generation error:', e);
      }
    }

    if (connection === 'close') {
      console.log('❌ Connection closed, restarting...');
      startBot();
    }

    if (connection === 'open') {
      console.log('✅ Connected to WhatsApp!');
    }
  });

  // 📩 Handle incoming messages
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg.message) return;

      const from = msg.key.remoteJid;
      const body = msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption || "";

      const prefix = '.';
      if (!body.startsWith(prefix)) return;

      const args = body.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      if (commands[commandName]) {
        await commands[commandName](sock, msg, args);
      }
    } catch (err) {
      console.error('❌ Error handling message:', err);
    }
  });
}

// 📡 Start the bot
startBot();