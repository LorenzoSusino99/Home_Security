const axios = require('axios');

const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN; // salva il token nel .env
const TELEGRAM_BASE_URL = `https://api.telegram.org/bot${TELEGRAM_API_TOKEN}`;

async function sendTelegramMessage(chatId, message) {
    try {
        await axios.post(`${TELEGRAM_BASE_URL}/sendMessage`, {
            chat_id: chatId,
            text: message
        });
    } catch (err) {
        console.error("Errore invio messaggio Telegram:", err.response?.data || err.message);
    }
}

module.exports = { sendTelegramMessage };
