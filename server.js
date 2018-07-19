// var express = require('express');
// var app = express();
// var server = require('http').Server(app);
// var io = require('socket.io')(server);

// server.listen(80);

// app.use(express.static('public'));

// io.on('connection', function (socket) {
//     socket.on('chat-message', function (data) {
//         io.sockets.emit('chat-message', data);
//     });
// });

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, '/index.html');

const server = express()
    .use((req, res) => res.sendFile(INDEX))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

io.on('connection', (socket) => {
    socket.on('chat-message', function (data) {
        io.sockets.emit('chat-message', data);
    });
});

// setInterval(() => io.emit('time', new Date().toTimeString()), 1000);