window.addEventListener('resize', resetWindowSize);

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        document.title = 'Heroku Chat';
        UserState.unreadMessages = 0;
    }
});

Elements.Send.addEventListener('click', () => {
    const message = getMessage();
    const username = getUsername();
    if (message) {
        socket.emit(Events.CHAT.USER.MESSAGE.SEND, {
            username: username,
            message: htmlEncode(message)
        });
        Elements.Message.value = '';
    }
});

Elements.Message.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const message = getMessage();
        const username = getUsername();
        if (message) {
            socket.emit(Events.CHAT.USER.MESSAGE.SEND, {
                username: username,
                message: htmlEncode(message)
            });
            Elements.Message.value = '';
        }
    }
});

document.getElementById('join').addEventListener('click', () => {
    const username = document.getElementById('username-input').value.trim();
    socket.emit(Events.SYSTEM.JOIN.REQUEST, username);
});

document.getElementById('username-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const username = document.getElementById('username-input').value.trim();
        socket.emit(Events.SYSTEM.JOIN.REQUEST, username);
    }
});

socket.on(Events.SYSTEM.USER.SIZE_DISPLAY, (numberOfUsers) => {
    if (UserState.userJoined)
        return;
    const element = document.getElementById('numberofpeople');
    element.textContent = numberOfUsers + ' entered';
});

socket.on(Events.SYSTEM.JOIN.SUCCESS, (username) => {
    UserState.userJoined = true;
    Elements.Username.textContent = username;
    Elements.Box.style.display = 'block';
    document.body.removeChild(document.getElementById('username-page'));
});

socket.on(Events.SYSTEM.JOIN.FAILED, (message) => {
    const errorDiv = document.getElementById('error-message');
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
});

socket.on(Events.CHAT.USER.JOIN, (data) => {
    if (!UserState.userJoined)
        return;
    if (document.hidden) {
        UserState.unreadMessages++;
        document.title = `(${UserState.unreadMessages}) Heroku Chat`;
    }
    const { time } = getTimestamp();
    const fontsize = getChatFontSize();
    const html = data.html.format(fontsize, time, data.username);
    updateChat(html);
});

socket.on(Events.CHAT.USER.DISCONNECTED, (data) => {
    if (!UserState.userJoined)
        return;
    if (document.hidden) {
        UserState.unreadMessages++;
        document.title = `(${UserState.unreadMessages}) Heroku Chat`;
    }
    const { time } = getTimestamp();
    const fontsize = getChatFontSize();
    const html = data.html.format(fontsize, time, data.username);
    updateChat(html);
});

socket.on(Events.CHAT.USER.MESSAGE.RECEIVE, (data) => {
    if (!UserState.userJoined)
        return;
    if (document.hidden) {
        UserState.unreadMessages++;
        document.title = `(${UserState.unreadMessages}) Heroku Chat`;
    }
    const { time } = getTimestamp();
    const fontsize = getChatFontSize();
    const html = data.html.format(fontsize, time, data.username, urlify(data.message));
    updateChat(html);
});