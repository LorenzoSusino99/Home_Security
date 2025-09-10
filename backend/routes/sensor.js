/**
 * @description Questo file si occupa di gestire il routing per le pagine inerenti ai sensori del sistema
 */

const express = require('express');
const router = express.Router();

require('dotenv').config();

var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');
const sensorController = require('../controllers/sensorController');

//router.get('/get', auth.authenticateToken, checkRole.isAdmin, sensorController.getAllUsers);

router.get('/gas', sensorController.getGasSensors);
router.get('/burglar', sensorController.getBurglarSensors);
router.get('/gasAlarm', sensorController.getGasAlarms);
router.get('/burglarAlarm', sensorController.getBurglarAlarms);
router.patch('/updateAlarmStatus', sensorController.updateAlarmStatus);
router.patch('/updateSystemStatus', sensorController.updateSystemStatus);
router.get('/history/:deviceId', sensorController.getSensorHistory);

module.exports = router;