'use strict';
console.log(__dirname + '\\..\\public');
const express = require('express');
const app = express().use(express.static(__dirname + '\\..\\public'));
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Listening to port:${PORT}`));

const eventHandler = require('./handler/eventHandler');
eventHandler.start(io);