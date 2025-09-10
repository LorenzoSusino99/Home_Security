const { ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const ddb = require('../db');

(async () => {
    try {
        const result = await ddb.send(new ScanCommand({ TableName: "Users" }));

        const items = result.Items || [];
        for (const item of items) {
            await ddb.send(new DeleteCommand({
                TableName: "Users",
                Key: {
                    username: item.username
                }
            }));
            console.log(`Cancellato utente: ${item.username}`);
        }

        console.log("Tabella svuotata.");
    } catch (err) {
        console.error("Errore durante la cancellazione:", err);
    }
})();