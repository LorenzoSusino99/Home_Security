/**
 * @description Questo file fornisce middleware per verificare il ruolo di un utente
 */
require('dotenv').config();

function isAdmin(req, res, next) {
    if (res.locals.role != "admin") {
        res.sendStatus(401);
    }
    else {
        next();
    }
}

module.exports = {
    isAdmin: isAdmin
}