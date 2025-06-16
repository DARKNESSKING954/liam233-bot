// 📱 LiamBot WhatsApp bot core — command loader and message handler

import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import Pino from 'pino';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import { Boom } from '@hapi/boom';
import { exec } from 'child_process';
import { askChatGPT } from './chatgpt.js'; // 🧠 ChatGPT integration

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = {};
const chatgptToggle = {}; // 🧠 Track ChatGPT toggle per chat

// 🔄 Load all command modules
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = path.join(__dirname, 'commands', file);
  const commandModule = await import(`file://${filePath}`);
  if (typeof commandModule.default === 'function') {
    const commandName = file.replace('.js', '').toLowerCase();
    commands[commandName] = commandModule.default;
  } else {
    const cmds = commandModule.default || commandModule;
    for (const [commandName, commandFunc] of Object.entries(cmds)) {
      commands[commandName.toLowerCase()] = commandFunc;
    }
  }
}
console.log(`✅ Loaded ${Object.keys(commands).length} commands.`);

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
        await QRCode.toFile('qr.png', qr, { width: 300, margin: 2 });
        console.log('QR code saved to qr.png. Scan with WhatsApp.');
        const platform = process.platform;
        if (platform === 'win32') exec('start qr.png');
        else if (platform === 'darwin') exec('open qr.png');
        else if (platform === 'linux') exec('xdg-open qr.png');
      } catch (e) {
        console.error('Error generating QR code:', e);
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
    const isGroup = from.endsWith('@g.us');

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      "";

    const prefix = '.';
    const args = body.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    // 🌐 Handle ChatGPT toggle command
    if (body.startsWith(prefix) && (commandName === 'chatgpt')) {
      const sub = args[0]?.toLowerCase();
      if (sub === 'on') {
        chatgptToggle[from] = true;
        await sock.sendMessage(from, { text: '🤖 ChatGPT is now ON for this chat.' });
      } else if (sub === 'off') {
        chatgptToggle[from] = false;
        await sock.sendMessage(from, { text: '🛑 ChatGPT is now OFF for this chat.' });
      } else {
        await sock.sendMessage(from, { text: '⚙️ Use `.chatgpt on` or `.chatgpt off`' });
      }
      return;
    }

    // 🧠 Handle other commands
    if (body.startsWith(prefix)) {
      if (commands[commandName]) {
        try {
          await commands[commandName](sock, msg, args);
        } catch (err) {
          console.error(`❌ Error running command ${commandName}:`, err);
          await sock.sendMessage(from, { text: `❌ Error running command: ${commandName}` });
        }
      }
      return;
    }

    // 💬 Handle normal text with ChatGPT (if toggled on)
    if (chatgptToggle[from]) {
      try {
        const reply = await askChatGPT(body);
        await sock.sendMessage(from, { text: reply });
      } catch (err) {
        console.error('❌ ChatGPT error:', err);
        await sock.sendMessage(from, { text: '⚠️ ChatGPT failed to respond.' });
      }
    }
  });
}

startBot();