const socket = io();

const UserScreen = {
    width: undefined,
    height: undefined
};

const UserState = {
    atBottom: false,
    userJoined: false,
    unreadMessages: 0
}

const Elements = {
    Box: document.getElementById('box'),
    Username: document.getElementById('username'),
    Message: document.getElementById('message'),
    Send: document.getElementById('send'),
    Chat: document.getElementById('chat')
};

// https://stackoverflow.com/questions/610406/javascript-printf-string-format/4673436#4673436
if (!String.prototype.format) {
    String.prototype.format = function () {
        const args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

const resetWindowSize = () => {
    UserScreen.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    UserScreen.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    if (document.getElementById('username-page') !== null) {
        const StartMenu = {
            fontHeight: Math.round(UserScreen.height * (UserScreen.width >= UserScreen.height ? 2 / 109 : 16 / 981)),
            fontWidth: Math.round(UserScreen.width * (UserScreen.width >= UserScreen.height ? 3 / 320 : 16 / 561)),
            fontSize: undefined
        };
        StartMenu.fontSize = Math.max(StartMenu.fontHeight, StartMenu.fontWidth);
        document.getElementById('username-input').style.fontSize = StartMenu.fontSize + 'px';
        document.getElementById('join').style.fontSize = StartMenu.fontSize + 'px';
        document.getElementById('numberofpeople').style.fontSize = StartMenu.fontSize + 'px';

        const ErrorMessage = {
            fontHeight: Math.round(UserScreen.height * (UserScreen.width >= UserScreen.height ? 16 / 981 : 14 / 981)),
            fontWidth: Math.round(UserScreen.width * (UserScreen.width >= UserScreen.height ? 1 / 120 : 14 / 561)),
            fontSize: undefined
        };
        ErrorMessage.fontSize = Math.max(ErrorMessage.fontHeight, ErrorMessage.fontWidth);
        document.getElementById('error-message').style.fontSize = ErrorMessage.fontSize + 'px';
    }

    Elements.Box.style.height = UserScreen.height + 'px';

    const UI = {
        fontHeight: Math.round(UserScreen.height * (UserScreen.width >= UserScreen.height ? .04 : .035)),
        fontWidth: Math.round(UserScreen.width * (UserScreen.width >= UserScreen.height ? .035 : .04)),
        fontSize: undefined
    };
    UI.fontSize = Math.min(UI.fontHeight, UI.fontWidth);

    Elements.Username.style.lineHeight = Math.round(UserScreen.height * .1) + 'px';
    Elements.Username.style.fontSize = UI.fontSize + 'px';
    Elements.Message.style.fontSize = UI.fontSize + 'px';
    Elements.Send.style.fontSize = UI.fontSize + 'px';

    const pTag = {
        textBlock: document.getElementsByClassName('text-block'),
        fontHeight: Math.round(UserScreen.height * (UserScreen.width >= UserScreen.height ? .03 : .025)),
        fontWidth: Math.round(UserScreen.width * (UserScreen.width >= UserScreen.height ? .025 : .03)),
        fontSize: undefined
    };
    pTag.fontSize = Math.min(pTag.fontHeight, pTag.fontWidth);

    for (let x = 0; x < pTag.textBlock.length; x++)
        pTag.textBlock[x].style.fontSize = pTag.fontSize + 'px';

    if (UserState.atBottom) {
        const chat = document.getElementById('chat');
        chat.scrollTop = chat.scrollHeight;
    }
};

const getMessage = () => {
    return Elements.Message.value.trim();
};

const getUsername = () => {
    return Elements.Username.textContent.trim();
};

const getTimestamp = () => {
    const timestamp = {
        date: new Date(),
        hours: undefined,
        mins: undefined,
        time: undefined
    };
    timestamp.hours = timestamp.date.getHours();
    timestamp.mins = timestamp.date.getMinutes();
    timestamp.time = (timestamp.hours < 10 ? '0' : '') + timestamp.hours + ':' + (timestamp.mins < 10 ? '0' : '') + timestamp.mins;
    return timestamp;
};

const getChatFontSize = () => {
    const fontHeight = Math.round(UserScreen.height * (UserScreen.width >= UserScreen.height ? .03 : .025));
    const fontWidth = Math.round(UserScreen.width * (UserScreen.width >= UserScreen.height ? .025 : .03));
    const fontSize = Math.min(fontHeight, fontWidth);
    return fontSize;
};

const updateChat = (html) => {
    // https://stackoverflow.com/questions/5086401/how-do-you-detect-when-youre-near-the-bottom-of-the-screen-with-jquery
    UserState.atBottom = 5 > Math.abs(Elements.Chat.scrollTop - (Elements.Chat.scrollHeight - Elements.Chat.offsetHeight));
    Elements.Chat.innerHTML += html;
    if (UserState.atBottom)
        Elements.Chat.scrollTop = Elements.Chat.scrollHeight;
};

// https://stackoverflow.com/a/7124052
const htmlEncode = (value) => {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

// https://stackoverflow.com/a/1500501
const urlify = (text) => {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        // https://stackoverflow.com/a/17711167
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
};

resetWindowSize();