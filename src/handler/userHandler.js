'use strict';

// <socket.id, username>
const ids = new Map();

// <username, socket.id>
const usernames = new Map();

const Username = {
    REGEX: /^[a-z]{1,20}$/i
};

module.exports = {
    size() {
        return ids.size;
    },
    hasUsername(username) {
        return usernames.has(username);
    },
    isValidUsername(username) {
        return Username.REGEX.test(username);
    },
    addUser(username, socketId) {
        ids.set(socketId, username);
        usernames.set(username, socketId);
    },
    removeUser(socketId) {
        const username = ids.get(socketId);
        ids.delete(socketId);
        usernames.delete(username);
    },
    getUsername(socketId) {
        return ids.get(socketId);
    }
};