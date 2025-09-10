require('dotenv').config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// DynamoDB config
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(client);

// Dati fittizi per l'allarme
const newAlarm = {
    ID: uuidv4(), // genera un ID univoco
    timestamp: new Date().toISOString(), // timestamp corrente
    deviceId: 'esp1',
    status: 'pending',
    type: 'smoke', // o 'burglary'
    timestampRead: ''
};

async function addAlarm() {
    try {
        await ddb.send(new PutCommand({
            TableName: 'Alarms',
            Item: newAlarm
        }));

        console.log('✅ Allarme inserito:', newAlarm);
    } catch (err) {
        console.error('❌ Errore inserimento allarme:', err);
    }
}

addAlarm();
