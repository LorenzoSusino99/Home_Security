/**
 * @description Questo file si occupa di gestire il routing per le pagine inerenti agli utenti del sistema
 */

const express = require('express');
const router = express.Router();

require('dotenv').config();

var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.get('/get', auth.authenticateToken, checkRole.isAdmin, userController.getAllUsers);
router.post('/forgotPassword', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/changePassword', auth.authenticateToken, userController.changePassword);
router.get('/me', auth.authenticateToken, userController.getCurrentUser);
router.patch('/update', auth.authenticateToken, userController.updateUser);

/** Verifica la validità di un token di accesso
 * @returns {number, string} Restituisce status code + messaggio di conferma
*/
router.get('/checkToken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({ message: "true" });
});

module.exports = router;