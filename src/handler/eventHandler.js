'use strict';

const Events = require('../events');
const UserHandler = require('./userHandler');

module.exports = {
    start(io) {

        io.on('connection', socket => {
            socket.emit(Events.SYSTEM.USER.SIZE_DISPLAY, UserHandler.size());

            socket.on(Events.SYSTEM.JOIN.REQUEST, username => {
                if (UserHandler.isValidUsername(username) && !UserHandler.hasUsername(username)) {
                    UserHandler.addUser(username, socket.id);
                    socket.emit(Events.SYSTEM.JOIN.SUCCESS, username);
                    io.sockets.emit(Events.SYSTEM.USER.SIZE_DISPLAY, UserHandler.size());
                    io.sockets.emit(Events.CHAT.USER.JOIN, {
                        username: username,
                        html: '<p class="text-block" style="font-size:{0}px; color:gray;">{1} {2} has connected</p>'
                    });
                } else {
                    let message;
                    if (UserHandler.hasUsername(username)) {
                        message = 'Username is already taken';
                    } else if (!UserHandler.isValidUsername(username)) {
                        message = 'Username must be between 1-20 characters and consist of only letters';
                    }
                    socket.emit(Events.SYSTEM.JOIN.FAILED, message);
                }
            });

            socket.on(Events.SYSTEM.USER.DISCONNECT, () => {
                const username = UserHandler.getUsername(socket.id);
                UserHandler.removeUser(socket.id);
                io.sockets.emit(Events.SYSTEM.USER.SIZE_DISPLAY, UserHandler.size());
                io.sockets.emit(Events.CHAT.USER.DISCONNECTED, {
                    username: username,
                    html: '<p class="text-block" style="font-size:{0}px; color:gray;">{1} {2} has disconnected</p>'
                });
            });

            socket.on(Events.CHAT.USER.MESSAGE.SEND, data => {
                io.sockets.emit(Events.CHAT.USER.MESSAGE.RECEIVE, {
                    message: data.message,
                    username: data.username,
                    html: '<p class="text-block" style="font-size:{0}px;"><span style="color:gray;">{1}</span> <b style="color:#569cd6;">{2}:</b><span style="color:#ce9178;"> {3}</span></p>'
                });
            });
        });

    }
};