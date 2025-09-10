require('dotenv').config();
const ddb = require('./../db');
const bcrypt = require('bcrypt');
const { GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");


const sensorController = {
    getGasSensors: async (req, res) => {
        try {
            const result = await ddb.send(new ScanCommand({
                TableName: "SensorData",
                FilterExpression: "#type = :type",
                ExpressionAttributeNames: {
                    "#type": "type"
                },
                ExpressionAttributeValues: {
                    ":type": "smoke"
                }
            }));
            const items = result.Items || [];

            // Mappa per ottenere l'ultima lettura per ogni deviceId
            const latestPerDevice = {};

            for (const item of items) {
                const existing = latestPerDevice[item.deviceId];
                if (!existing || item.timestamp > existing.timestamp) {
                    latestPerDevice[item.deviceId] = item;
                }
            }

            const finalResults = Object.values(latestPerDevice);

            return res.status(200).json(finalResults);
        } catch (err) {
            console.error("Errore getGasSensors:", err);
            return res.status(500).json(err);
        }
    },
    getBurglarSensors: async (req, res) => {
        try {
            const result = await ddb.send(new ScanCommand({
                TableName: "SensorData",
                FilterExpression: "#type = :type",
                ExpressionAttributeNames: {
                    "#type": "type"
                },
                ExpressionAttributeValues: {
                    ":type": "burglary"
                }
            }));

            const items = result.Items || [];

            // Mappa per ottenere l'ultima lettura per ogni deviceId
            const latestPerDevice = {};

            for (const item of items) {
                const existing = latestPerDevice[item.deviceId];
                if (!existing || item.timestamp > existing.timestamp) {
                    latestPerDevice[item.deviceId] = item;
                }
            }

            const finalResults = Object.values(latestPerDevice);

            return res.status(200).json(finalResults);

        } catch (err) {
            console.error("Errore getBurglarSensors:", err);
            return res.status(500).json(err);
        }
    },
    getGasAlarms: async (req, res) => {
        try {
            const result = await ddb.send(new ScanCommand({
                TableName: "Alarms",
                FilterExpression: "#type = :type",
                ExpressionAttributeNames: {
                    "#type": "type"
                },
                ExpressionAttributeValues: {
                    ":type": "smoke"
                }
            }));
            const items = result.Items || [];

            return res.status(200).json(items);
        } catch (err) {
            console.error("Errore getGasSensors:", err);
            return res.status(500).json(err);
        }
    },
    getBurglarAlarms: async (req, res) => {
        try {
            const result = await ddb.send(new ScanCommand({
                TableName: "Alarms",
                FilterExpression: "#type = :type",
                ExpressionAttributeNames: {
                    "#type": "type"
                },
                ExpressionAttributeValues: {
                    ":type": "burglary"
                }
            }));
            const items = result.Items || [];

            return res.status(200).json(items);
        } catch (err) {
            console.error("Errore getGasSensors:", err);
            return res.status(500).json(err);
        }
    },
    // Aggiorna lo status di un allarme (es. da 'pending' a 'resolved')
    updateAlarmStatus: async (req, res) => {
        const { ID, timestamp, status } = req.body;
        console.log(req.body)

        if (!ID || !status) {
            return res.status(400).json({ message: "Dati mancanti: ID e status sono obbligatori." });
        }

        try {
            await ddb.send(new UpdateCommand({
                TableName: "Alarms",
                Key: {
                    ID: ID,
                    timestamp: timestamp
                },
                UpdateExpression: "SET #s = :status",
                ExpressionAttributeNames: {
                    "#s": "status"
                },
                ExpressionAttributeValues: {
                    ":status": status
                }
            }));

            return res.status(200).json({ message: "Stato allarme aggiornato con successo." });
        } catch (err) {
            console.error("Errore updateAlarmStatus:", err);
            return res.status(500).json(err);
        }
    },
    // Aggiorna lo stato del sistema (ON/OFF) per tipo (gas/burglary)
    updateSystemStatus: async (req, res) => {
        const { type, alarm } = req.body;
        console.log(req.body)

        if (!type || alarm === undefined) {
            return res.status(400).json({ message: "Dati mancanti: type e alarm sono obbligatori." });
        }

        try {
            await ddb.send(new UpdateCommand({
                TableName: "SystemStatus",
                Key: {
                    type
                },
                UpdateExpression: "SET #a = :alarm",
                ExpressionAttributeNames: {
                    "#a": "alarm"
                },
                ExpressionAttributeValues: {
                    ":alarm": alarm
                }
            }));

            return res.status(200).json({ message: "Stato del sistema aggiornato con successo." });
        } catch (err) {
            console.error("Errore updateSystemStatus:", err);
            return res.status(500).json(err);
        }
    },
    getSensorHistory: async (req, res) => {
        const { deviceId } = req.params;
        let deviceId_ = deviceId.trim()

        try {
            const result = await ddb.send(new ScanCommand({
                TableName: 'SensorData',
                FilterExpression: "deviceId = :deviceId",
                ExpressionAttributeValues: {
                    ":deviceId": deviceId_
                }
            }));

            const items = result.Items || [];

            // Ordina i dati dal più recente al più vecchio
            items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

            return res.status(200).json(items);
        } catch (err) {
            console.error("Errore getSensorHistory:", err);
            return res.status(500).json({ message: "Errore durante il recupero dei dati" });
        }
    }

};

module.exports = sensorController;