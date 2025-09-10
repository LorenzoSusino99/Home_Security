const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { fromIni } = require("@aws-sdk/credential-provider-ini");

// Configura DynamoDB client (usa la regione corretta)
const client = new DynamoDBClient({
    region: "eu-north-1",
    credentials: fromIni({ profile: "default" })
});
const docClient = DynamoDBDocumentClient.from(client);

module.exports = docClient;