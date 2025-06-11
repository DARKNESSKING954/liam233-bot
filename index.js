// 📱 LiamBot WhatsApp bot core — command loader and message handler

import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import Pino from 'pino';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import { Boom } from '@hapi/boom';

// 🛣️ Directory path helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📦 Command storage
const commands = {};

// 🔄 Dynamically load all command modules from /commands folder
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = path.join(__dirname, 'commands', file);
  const commandModule = await import(`file://${filePath}`);

  for (const [commandName, commandFunc] of Object.entries(commandModule)) {
    commands[commandName.toLowerCase()] = commandFunc;
  }
}
console.log(`✅ Loaded ${Object.keys(commands).length} commands.`);

// 📞 Initialize WhatsApp socket connection
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({
    logger: Pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: ['LiamBot', 'Chrome', '6.7.18']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        console.log('Scan this QR code with WhatsApp:');
        await QRCode.toString(qr, { type: 'terminal',small:true }, (err, url) => {
          if (err) console.error('Failed to generate QR code:', err);
          else console.log(url);
        });
      } catch (e) {
        console.error('QR code generation error:', e);
      }
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true;

      console.log('Connection closed, reconnecting?', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ Connected to WhatsApp!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      "";

    const prefix = '.';
    if (!body.startsWith(prefix)) return;

    const args = body.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (commands[commandName]) {
      try {
        await commands[commandName](sock, msg, args);
      } catch (err) {
        console.error(`❌ Error running command ${commandName}:`, err);
        await sock.sendMessage(from, { text: `❌ Error running command: ${commandName}` });
      }
    }
  });
}

startBot();
