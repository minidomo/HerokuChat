'use strict';

var express = require('express');
var PORT = process.env.PORT || 3000;
var server = express()
    .use(express.static('public'))
    .listen(PORT, function () {
        console.log(`Listening on ${PORT}`)
    });
var io = require('socket.io')(server);

io.on('connection', (socket) => {
    socket.on('chat-message', function (data) {
        io.sockets.emit('chat-message', data);
    });
});