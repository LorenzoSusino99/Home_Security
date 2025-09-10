const { ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const ddb = require('../db');

(async () => {
    try {
        const result = await ddb.send(new ScanCommand({ TableName: "SensorData" }));

        const items = result.Items || [];
        for (const item of items) {
            await ddb.send(new DeleteCommand({
                TableName: "SensorData",
                Key: {
                    timestamp: item.timestamp
                }
            }));
            console.log(`Cancellato item: ${item.deviceId} - ${item.timestamp}`);
        }

        console.log("Tabella svuotata.");
    } catch (err) {
        console.error("Errore durante la cancellazione:", err);
    }
})();