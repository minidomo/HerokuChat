var socket = io();

var UserScreen = {
    width: undefined,
    heigt: undefined
};

var CurrentState = {
    atBottom: false,
    userJoined: false
};

var ElementObject = {
    box: document.getElementById('box'),
    username: document.getElementById('username'),
    message: document.getElementById('message'),
    send: document.getElementById('send')
};

console.log('Original Res: ' + (window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth) + ' x ' + (window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight));

resetWindowSize();

// functions
function resetWindowSize() {
    UserScreen.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    UserScreen.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    // console.log(width >= height ? 'width bigger' : 'height bigger');

    ElementObject.box.style.height = UserScreen.height + 'px';

    var UI = {
        fontHeight: Math.round(UserScreen.height * (UserScreen.width >= UserScreen.height ? .04 : .035)),
        fontWidth: Math.round(UserScreen.width * (UserScreen.width >= UserScreen.height ? .035 : .04)),
        fontSize: undefined
    };
    UI.fontSize = Math.min(UI.fontHeight, UI.fontWidth);

    ElementObject.username.style.lineHeight = Math.round(UserScreen.height * .1) + 'px';
    ElementObject.username.style.fontSize = UI.fontSize + 'px';
    ElementObject.message.style.fontSize = UI.fontSize + 'px';
    ElementObject.send.style.fontSize = UI.fontSize + 'px';

    var pTag = {
        textBlock: document.getElementsByClassName('text-block'),
        fontHeight: Math.round(UserScreen.height * (UserScreen.width >= UserScreen.height ? .03 : .025)),
        fontWidth: Math.round(UserScreen.width * (UserScreen.width >= UserScreen.height ? .025 : .03)),
        fontSize: undefined
    };
    pTag.fontSize = Math.min(pTag.fontHeight, pTag.fontWidth);

    for (var x = 0; x < pTag.textBlock.length; x++)
        pTag.textBlock[x].style.fontSize = pTag.fontSize + 'px';

    if (CurrentState.atBottom) {
        var chat = document.getElementById('chat');
        chat.scrollTop = chat.scrollHeight;
    }
}

function sendMessage() {
    var user = ElementObject.username.textContent.trim(),
        msg = ElementObject.message.value.trim();

    if (msg === '' || !CurrentState.userJoined)
        return;

    if (msg.startsWith('/')) {
        socket.emit('chat-command', {
            username: user,
            message: msg
        });
        ElementObject.message.value = '';
        return;
    }

    socket.emit('chat-userMessage', {
        username: user,
        message: msg
    });
    ElementObject.message.value = '';
}

// TODO make better
function updateChat(data) {
    if (!CurrentState.userJoined)
        return;

    var Chat = {
        element: document.getElementById('chat'),
        fontHeight: Math.round(UserScreen.height * (UserScreen.width >= UserScreen.height ? .03 : .025)),
        fontWidth: Math.round(UserScreen.width * (UserScreen.width >= UserScreen.height ? .025 : .03)),
        fontSize: undefined
    };
    Chat.fontSize = Math.min(Chat.fontHeight, Chat.fontWidth);

    // https://stackoverflow.com/questions/5086401/how-do-you-detect-when-youre-near-the-bottom-of-the-screen-with-jquery
    CurrentState.atBottom = 5 > Math.abs(Chat.element.scrollTop - (Chat.element.scrollHeight - Chat.element.offsetHeight));
    // console.log(Chat.element.scrollTop + ' ' + (Chat.element.scrollHeight - Chat.element.offsetHeight));

    var TimeStamp = {
        date: new Date(),
        hours: undefined,
        mins: undefined,
        time: undefined
    };
    TimeStamp.hours = TimeStamp.date.getHours();
    TimeStamp.mins = TimeStamp.date.getMinutes();
    TimeStamp.time = (TimeStamp.hours < 10 ? '0' : '') + TimeStamp.hours + ':' + (TimeStamp.mins < 10 ? '0' : '') + TimeStamp.mins;

    if (data.type === 'user-chat') {
        Chat.element.innerHTML += StringFormat(data.format, [Chat.fontSize, TimeStamp.time, data.username, data.message]);
    } else if (data.type === 'server-userConnected') {
        Chat.element.innerHTML += StringFormat(data.format, [Chat.fontSize, TimeStamp.time, data.username]);
    } else if (data.type === 'server-userDisconnected') {
        Chat.element.innerHTML += StringFormat(data.format, [Chat.fontSize, TimeStamp.time, data.username]);
    } else if (data.type === 'command') {
        Chat.element.innerHTML += data.format.split('%s').join('' + Chat.fontSize);
    } else {
        return;
    }

    // doesnt work on Edge TODO
    if (CurrentState.atBottom)
        Chat.element.scrollTop = Chat.element.scrollHeight;
}

function StringFormat(string, args) {
    for (var str = string.indexOf('%s'), index = 0; str !== -1 && index < args.length; str = string.indexOf('%s'), index++) {
        string = string.replace(string.substr(str, 2), args[index]);
    }
    return string;
}

// event listeners
window.addEventListener('resize', function () {
    resetWindowSize();
});

ElementObject.send.addEventListener('click', function () {
    sendMessage();
});

ElementObject.message.addEventListener('keypress', function (e) {
    if (e.key === 'Enter')
        sendMessage();
});

document.getElementById('join').addEventListener('click', function () {
    var name = document.getElementById('username-input').value.trim();
    socket.emit('join-request', name);
});


// socket event listeners
socket.on('chat-message', function (data) {
    updateChat(data);
});

socket.on('chat-numberchange', function (data) {
    var ele = document.getElementById('numberofpeople')
    if (ele !== null) {
        ele.textContent = data.number + ' entered';
    } else {
        updateChat(data);
    }
});

socket.on('join-valid', function (data) {
    var username = data.username;
    CurrentState.userJoined = true;
    ElementObject.username.textContent = username;
    document.getElementById('box').style.display = 'block';
    document.body.removeChild(document.getElementById('username-page'));
});

socket.on('join-invalid', function (data) {
    // show error msg on screen
    var div = document.getElementById('error-message');
    div.style.display = 'block';
    div.textContent = data.message;
});