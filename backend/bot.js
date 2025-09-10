require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_API_TOKEN;
console.log("Token Telegram:", token);

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const message = `👋 Ciao! Il tuo Telegram ID è: ${chatId}\n\nInseriscilo nel tuo profilo utente per ricevere le notifiche dal sistema.`;

    bot.sendMessage(chatId, message);
});
