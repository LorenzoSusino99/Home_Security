/**
 * @description Questo file fornisce un middleware per verificare se un utente è autenticato
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        console.log("Token = null");
        return res.sendStatus(401);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, response) => {
        if (err) {
            console.log("Token expired")
            return res.sendStatus(403);
        }
        res.locals = response;
        next();
    });
}

module.exports = { authenticateToken: authenticateToken };