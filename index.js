'use strict';
const express = require('express');
const app = express().use(express.static('public'));
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Listening to port:${PORT}`));

const eventHandler = require('./src/handler/eventHandler');
eventHandler.start(io);