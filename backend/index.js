/**
 * @description Questo file si occupa di inizializzare il modulo dell'app
 */

const express = require('express');
const cors = require('cors');

const userRoute = require('./routes/user');
const sensorRoute = require('./routes/sensor');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/user', userRoute);
app.use('/sensor', sensorRoute);


module.exports = app;