import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@adiwajshing/baileys';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode-terminal';

// Load commands dynamically
const commands = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  for (const [name, func] of Object.entries(command)) {
    commands[name.toLowerCase()] = func;
  }
}

console.log(`✅ Loaded ${Object.keys(commands).length} commands.`);

async function startBot() {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`✅ Using WhatsApp Web version: ${version}, latest: ${isLatest}`);

  const { state, saveCreds } = await useMultiFileAuthState('auth');

  const sock = makeWASocket({
    version,
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

    if (connection === 'open') {
      console.log('✅ Bot connected successfully!');
    }

    if (connection === 'close') {
      console.log('❌ Connection closed:', lastDisconnect?.error?.output?.statusCode);
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        startBot();
      }
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
        await sock.sendMessage(from, { text: `❌ Error running command: ${commandName}` });
      }
    }
  });
}

startBot();