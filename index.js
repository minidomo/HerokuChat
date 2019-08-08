'use strict';

const express = require('express');
const app = express().use(express.static('public'));
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Listening to port:${PORT}`));

io.on('connection', socket => {
    console.log(socket.id + ' connected');
    // display current number amount of people within the chatroom
    socket.emit('chat-numberchange', { number: usersInChat.length });

    socket.on('chat-userMessage', data => {
        data['type'] = 'user-chat';
        data['format'] = '<p class="text-block" style="font-size:%spx;"><span style="color:gray;">%s</span> <b style="color:#569cd6;">%s:</b><span style="color:#ce9178;"> %s</span></p>';
        io.sockets.emit('chat-message', data);
    });

    socket.on('chat-command', data => {
        let command = data.message.split(' ')[0];
        if (typeof Commands[command] === "undefined") {
            data['type'] = 'user-chat';
            data['format'] = '<p class="text-block" style="font-size:%spx;"><span style="color:gray;">%s</span> <b style="color:#569cd6;">%s:</b><span style="color:#ce9178;"> %s</span></p>';
            io.sockets.emit('chat-message', data);
            return;
        }
        // returning the command to the user
        Commands[command].Adjust(data, socket);
        socket.emit('chat-message', data);
    });

    socket.on('join-request', name => {
        // https://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender
        if (usersInChat.indexOf(name) === -1 && name.match('[a-zA-Z]') !== null && name.length <= 20 && name.indexOf(' ') === -1) {
            // add username to the array usersInChat to prevent a duplicate username
            // add the user's socket id to the users object with their username attached to keep track of it
            // send message to everyone, that a new user has joined the chatroom
            // update the display of how many people are in the chatroom for those that are at the beginning screen
            console.log(name + ' joined the chatroom');
            usersInChat.push(name);
            users[socket.id] = { username: name };

            socket.emit('join-valid', {
                username: name
            });
            io.sockets.emit('chat-numberchange', {
                username: name,
                number: usersInChat.length,
                type: 'server-userConnected',
                format: '<p class="text-block" style="font-size:%spx; color:gray;">%s %s has connected</p>'
            });
        } else {
            // display an error on the users beginning screen with an appropriate message
            let msg;
            if (usersInChat.indexOf(name) >= 0)
                msg = 'Username is already taken';
            else if (name.match('[a-zA-Z]') === null)
                msg = 'Username must have letters';
            else if (name.length > 20)
                msg = 'Username is too long (must be within 20 characters)';
            else if (name.indexOf(' ') >= 0)
                msg = 'Username cannot have spaces';
            else
                msg = 'Username error unaccounted for';

            console.log(name + ' could not join: ' + msg);

            socket.emit('join-invalid', {
                message: msg
            });
        }
    });

    socket.on('disconnect', () => {
        // check to see if the user's socket id is in the users object, if undefined, do nothing
        // else, send message to everyone else but the user that they have disconnected
        // remove their username from the usersInChat array and socket id from the users object
        // update the number on the beginning screen if a user is on it
        if (typeof users[socket.id] === "undefined")
            return;

        let userIndex = usersInChat.indexOf(users[socket.id].username);

        console.log(socket.id + ': ' + usersInChat[userIndex] + ' disconnected');

        usersInChat.splice(userIndex, 1);

        io.sockets.emit('chat-numberchange', {
            username: users[socket.id].username,
            number: usersInChat.length,
            type: 'server-userDisconnected',
            format: '<p class="text-block" style="font-size:%spx; color:gray;">%s %s has disconnected</p>'
        });

        delete users[socket.id];
    });
});

const usersInChat = [];
const users = {};
const Commands = {
    '/help': {
        description: 'Shows all the possible commands.',
        Adjust: (data, socket) => {
            let str = '';
            Object.keys(Commands).forEach(prop => str += '<p class="text-block" style="font-size:%spx; color:gray;">' + prop + ' - ' + Commands[prop].description + '</p>');
            data['type'] = 'command';
            data['format'] = str;
        }
    },
    '/list': {
        description: 'Shows the current users in the room.',
        Adjust: (data, socket) => {
            let str = '';
            usersInChat.forEach(s => str += '<p class="text-block" style="font-size:%spx; color:gray;">' + s + '</p>');
            data['type'] = 'command';
            data['format'] = str;
        }
    },
    '/msg': {
        description: 'Message one person directly. Usage: /msg [username] [message]',
        Adjust: (data, socket) => {
            data['type'] = 'user-chat';
            data.message = data.message.substring(5).trim();
            let receiverUsername = data.message.substring(0, data.message.indexOf(' ')).trim();
            if (receiverUsername === '')
                return;
            data.message = data.message.substring(receiverUsername.length, data.message.length).trim();
            let receiverID, receiverData = {
                username: 'From ' + data.username,
                message: data.message,
                type: data.type,
                format: '<p class="text-block" style="font-size:%spx; color:gray;"><i>%s %s: %s</i></p>'
            };
            for (let id in users) {
                if (users[id].username === receiverUsername) {
                    receiverID = id;
                    if (receiverID === socket.id) {
                        data.type = 'command';
                        data['format'] = '<p class="text-block" style="font-size:%spx; color:gray;">You cannot send a message to yourself.</p>'
                        return;
                    }
                    users[id].lastMessenger = socket.id;
                    break;
                }
            }
            if (typeof receiverID === "undefined") {
                data.type = 'command';
                data['format'] = '<p class="text-block" style="font-size:%spx; color:gray;">User ' + receiverUsername + ' was not found.</p>'
                return;
            }
            socket.broadcast.to(receiverID).emit('chat-message', receiverData);
            data.username = 'To ' + receiverUsername;
            data['format'] = receiverData.format;
        }
    },
    '/r': {
        description: 'Reply to the last person that messaged you. Usage: /r [message]',
        Adjust: (data, socket) => {
            data.message = data.message.substring(3).trim();
            if (data.message === '')
                return;
            data['type'] = 'user-chat';
            let receiverData = {
                username: 'From ' + data.username,
                message: data.message,
                type: data.type,
                format: '<p class="text-block" style="font-size:%spx; color:gray;"><i>%s %s: %s</i></p>'
            };
            let receiverID = users[socket.id].lastMessenger;
            if (typeof receiverID === "undefined") {
                data.type = 'command';
                data['format'] = '<p class="text-block" style="font-size:%spx; color:gray;">Someone must message you before you use this command.</p>';
                return;
            } else if (typeof users[receiverID] === "undefined") {
                data.type = 'command';
                data['format'] = '<p class="text-block" style="font-size:%spx; color:gray;">Could not find the user. This could be caused by the user disconnecting.</p>';
                return;
            }
            socket.broadcast.to(receiverID).emit('chat-message', receiverData);
            users[receiverID].lastMessenger = socket.id;
            data.username = 'To ' + users[receiverID].username;
            data['format'] = receiverData.format;
        }
    }
};