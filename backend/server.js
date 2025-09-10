/**
 * @description Questo file si occupa di inizializzare e avviare il server
 */

require('dotenv').config();
const http = require('http');
const app = require('./index');
const WebSocket = require('ws');
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const ddb = require('./db');
const { sendTelegramMessage } = require('./services/telegram');
const { IoTDataPlaneClient, GetThingShadowCommand } = require('@aws-sdk/client-iot-data-plane');

const iotDataClient = new IoTDataPlaneClient({
    region: process.env.AWS_REGION,
    endpoint: `https://${process.env.IOT_ENDPOINT}`
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = new Set();

wss.on('connection', (ws) => {
    console.log('✅ Nuovo client WebSocket connesso');
    clients.add(ws);

    ws.on('close', () => {
        console.log('❌ Client WebSocket disconnesso');
        clients.delete(ws);
    });
});

const deviceList = process.env.DEVICE_LIST.split(',');

async function fetchLatestSensorValues() {
    const results = [];

    for (const deviceId of deviceList) {
        try {
            const command = new GetThingShadowCommand({ thingName: deviceId.trim() });
            const response = await iotDataClient.send(command);

            const payload = JSON.parse(Buffer.from(response.payload).toString());
            const state = payload.state?.reported;
            results.push({
                deviceId,
                ...state
            });
        } catch (err) {
            console.error(`Errore nel recupero della shadow per ${deviceId}:`, err.message);
        }
    }
    //console.log(results)
    return results;
}

let notifiedAlarmIds = new Set();

// Funzione che controlla la tabella Alarms per notifiche
async function checkAlarms() {
    try {
        const result = await ddb.send(new ScanCommand({ TableName: 'Alarms' }));
        const items = result.Items || [];

        // Invia solo gli allarmi con status === 'pending'
        const activeAlarms = items.filter(alarm => alarm.status === 'pending');

        for (const alarm of activeAlarms) {
            const notification = {
                type: 'notification',
                level: 'danger',
                sensor: alarm,
                message: `Allarme attivo dal sensore ${alarm.deviceId} (${alarm.type})`
            };

            for (const client of clients) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(notification));
                }
            }
            if (!notifiedAlarmIds.has(alarm.ID)) {
                await notifyAlarmToUser(alarm);
                notifiedAlarmIds.add(alarm.ID);
            }
        }
    } catch (err) {
        console.error('Errore nel controllo allarmi:', err);
    }
}
// Eseguito ogni volta che arriva un nuovo pending
async function notifyAlarmToUser(alarm) {
    try {
        const result = await ddb.send(new ScanCommand({ TableName: "Users" }));
        const users = result.Items || [];
        //console.log(alarm)

        for (const user of users) {
            //console.log(user)
            if (user.telegramId) {
                const date = new Date(alarm.timestamp);
                const formatted = date.toLocaleString('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });

                const msg = `🚨 Nuovo allarme!\nTipo: ${alarm.type}\nDevice: ${alarm.deviceId}\nData: ${formatted}`;

                await sendTelegramMessage(user.telegramId, msg);
            }
        }
    } catch (err) {
        console.error("Errore invio notifiche Telegram:", err);
    }
}
// Ogni 2 secondi invia aggiornamenti

setInterval(async () => {
    const updates = await fetchLatestSensorValues();
    const message = JSON.stringify({ type: 'update', data: updates });

    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
    await checkAlarms()
}, 2000);

server.listen(process.env.PORT, function () {
    console.log("Backend Application listening at http://localhost:" + process.env.PORT);
});

process.on('SIGINT', () => {
    console.log('Ricevuto SIGINT, chiusura del server...');
    for (const client of clients) {
        client.terminate();
    }
    server.close(() => {
        console.log('Server chiuso.');
        process.exit(0);
    });
});
