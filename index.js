const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode-terminal');

const commands = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  for (const [name, func] of Object.entries(command)) {
    commands[name.toLowerCase()] = func;
  }
}

console.log(`✅ Loaded ${Object.keys(commands).length} commands.`);

async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
      logger: P({ level: 'silent' }),
      auth: state,
      printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        console.log('✅ QR code received — scan it!');
        QRCode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        console.log('❌ Connection closed — reason:', reason);
        if (reason !== DisconnectReason.loggedOut) {
          console.log('🔄 Reconnecting...');
          startBot();
        } else {
          console.log('📴 Logged out — delete auth folder to re-login.');
        }
      }

      if (connection === 'open') {
        console.log('✅ Bot connected!');
      }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (!msg.message) return;

      const from = msg.key.remoteJid;
      const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
      const prefix = '.';
      if (!body.startsWith(prefix)) return;

      const args = body.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      if (commands[commandName]) {
        try {
          await commands[commandName](sock, msg, args);
        } catch (err) {
          console.error(err);
          sock.sendMessage(from, { text: `❌ Command error: ${commandName}` });
        }
      }
    });
  } catch (err) {
    console.error('❌ Error starting bot:', err);
  }
}

startBot();