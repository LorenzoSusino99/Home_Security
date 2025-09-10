const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const ddb = require('./../db');
const bcrypt = require('bcrypt');
const { GetCommand, PutCommand, QueryCommand, UpdateCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

const userController = {

    /** signup
     * @returns {number, string} Restituisce status code + messaggio di errore/conferma registrazione
     */
    signup: async (req, res) => {
        const { username, email, password } = req.body;

        try {
            // 1. Controlla se esiste già un utente con quell'email
            const userCheck = await ddb.send(new QueryCommand({
                TableName: "Users",
                IndexName: "email-index",
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: {
                    ":email": email
                }
            }));

            if (userCheck.Items && userCheck.Items.length > 0) {
                return res.status(400).json({ message: "Email già registrata." });
            }

            // 2. Controlla se ci sono già utenti nella tabella
            const allUsers = await ddb.send(new ScanCommand({ TableName: "Users", Limit: 1 }));

            const assignedRole = (allUsers.Items.length === 0) ? "admin" : "family";

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = {
                email,
                username,
                password: hashedPassword,
                role: assignedRole
            };

            await ddb.send(new PutCommand({
                TableName: "Users",
                Item: user
            }));

            return res.status(200).json({ message: `Utente registrato con ruolo ${assignedRole}`, user });

        } catch (error) {
            console.error('Errore di registrazione:', error);
            return res.status(500).json(error);
        }
    },


    /** Restituisce l'elenco di utenti
    * @returns {number, string} Restituisce status code + elenco utenti/errore
    */
    getAllUsers: async (req, res) => {
        try {
            const result = await ddb.send(new ScanCommand({
                TableName: "users",
                ProjectionExpression: "email, username,  role"
            }));

            return res.status(200).json(result.Items);
        } catch (err) {
            console.error("Errore getAllUsers:", err);
            return res.status(500).json(err);
        }
    },

    /** Login
     * @returns {number, string} Restituisce status code + il token di autenticazione
    */
    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            const data = await ddb.send(new QueryCommand({
                TableName: "Users",
                IndexName: "email-index",
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: {
                    ":email": email
                }
            }));
            const user = data.Items && data.Items[0];
            console.log(user)
            if (!user) {
                return res.status(401).json({ message: "Email errata" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Password errata" });
            }
            const token = jwt.sign({
                email: user.email,
                role: user.role
            }, process.env.ACCESS_TOKEN, { expiresIn: '336h' });
            console.log(token)
            return res.status(200).json({ token });

        } catch (err) {
            return res.status(500).json(err);
        }
    },
    /** Password dimenticata
     * @returns {number, string} Restituisce status code + messaggio di conferma invio a prescindere dall'esistenza della email nel DB
     *                           per evitare di rivelare informazioni
    */
    forgotPassword: async (req, res) => {
        const { email } = req.body;

        try {
            const data = await ddb.send(new QueryCommand({
                TableName: "Users",
                IndexName: "email-index",
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: {
                    ":email": email
                }
            }));

            const user = data.Items && data.Items[0];

            // Risposta generica anche se l'utente non esiste
            if (!user) {
                return res.status(200).json({
                    message: "Se l'email è registrata, invieremo le istruzioni per reimpostare la password."
                });
            }

            // Genera token di reset valido per 1 ora
            const token = jwt.sign(
                { email: user.email },
                process.env.ACCESS_TOKEN,
                { expiresIn: '1h' }
            );

            // Invia email con il link di reset
            const resetLink = `http://localhost:4200/reset-password/${token}`;
            const mailOptions = {
                from: process.env.EMAIL,
                to: user.email,
                subject: 'Reimposta la tua password per GestOp',
                html: `<p>Per reimpostare la tua password, clicca sul seguente link:</p>
                   <a href="${resetLink}">${resetLink}</a>`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: "Errore nell'invio dell'email" });
                } else {
                    console.log('Email sent: ' + info.response);
                    return res.status(200).json({
                        message: "Se l'email è registrata, invieremo le istruzioni per reimpostare la password."
                    });
                }
            });
        } catch (error) {
            console.error('Errore durante il recupero dell\'utente:', error);
            return res.status(500).json(error);
        }
    },

    /** Modifica la password di un utente
     * @returns {number, string} Restituisce status code + messaggio esplicativo
    */
    changePassword: async (req, res) => {
        const { oldPassword, newPassword, email } = req.body;

        try {
            const result = await ddb.send(new QueryCommand({
                TableName: "Users",
                IndexName: "email-index",
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: {
                    ":email": email
                }
            }));

            const user = data.Items && data.Items[0];
            const username = user.username;
            if (!user) {
                return res.status(404).json({ message: "Utente non trovato." });
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Password errata" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await ddb.send(new UpdateCommand({
                TableName: "users",
                Key: { username },
                UpdateExpression: "SET password = :pwd",
                ExpressionAttributeValues: {
                    ":pwd": hashedPassword
                }
            }));

            return res.status(200).json({ message: "Password modificata con successo" });
        } catch (error) {
            console.error('Errore durante la modifica della password:', error);
            return res.status(500).json(error);
        }
    },
    getCurrentUser: async (req, res) => {
        const email = res.locals.email;
        try {
            const user = await ddb.send(new QueryCommand({
                TableName: "Users",
                IndexName: "email-index",
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: {
                    ":email": email
                }
            }));
            return res.status(200).json(user.Items[0]);
        } catch (err) {
            console.error(err);
            return res.status(500).json(err);
        }
    },
    updateUser: async (req, res) => {
        const email = res.locals.email;
        const { username, telegramId } = req.body;

        try {
            const result = await ddb.send(new QueryCommand({
                TableName: "Users",
                IndexName: "email-index",
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: {
                    ":email": email
                }
            }));

            const user = result.Items?.[0];
            if (!user) return res.status(404).json({ message: "Utente non trovato" });

            await ddb.send(new UpdateCommand({
                TableName: "Users",
                Key: {
                    username: user.username
                },
                UpdateExpression: "SET telegramId = :telegramId",
                ExpressionAttributeValues: {
                    ":telegramId": telegramId
                }
            }));

            return res.status(200).json({ message: "Utente aggiornato con successo" });
        } catch (err) {
            console.error("Errore updateUser:", err);
            return res.status(500).json(err);
        }
    },
    resetPassword: async (req, res) => {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token e nuova password sono richiesti." });
        }

        try {
            const payload = jwt.verify(token, process.env.ACCESS_TOKEN);
            const email = payload.email;

            const result = await ddb.send(new QueryCommand({
                TableName: "Users",
                IndexName: "email-index",
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: {
                    ":email": email
                }
            }));

            const user = result.Items?.[0];
            if (!user) return res.status(404).json({ message: "Utente non trovato." });

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await ddb.send(new UpdateCommand({
                TableName: "Users",
                Key: {
                    username: user.username
                },
                UpdateExpression: "SET password = :pwd",
                ExpressionAttributeValues: {
                    ":pwd": hashedPassword
                }
            }));

            return res.status(200).json({ message: "Password aggiornata con successo." });
        } catch (err) {
            console.error("Errore resetPassword:", err);
            return res.status(403).json({ message: "Token non valido o scaduto." });
        }
    }

};

module.exports = userController;