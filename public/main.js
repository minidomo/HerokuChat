var socket = io();
var width,
    height,
    boxDiv,
    usernameInput,
    messageInput,
    sendButton,
    atBottom;

reset();

// functions
function reset() {
    width = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

    height = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;

    // console.log(width + ' ' + height);

    boxDiv = document.getElementById('box');
    boxDiv.style.height = height + 'px';

    usernameInput = document.getElementById('username');
    messageInput = document.getElementById('message');
    sendButton = document.getElementById('send');

    var textHeight = Math.round(height * .04),
        textWidth = Math.round(width * .035);

    var minFontSize = Math.min(textHeight, textWidth);

    usernameInput.style.fontSize = minFontSize + 'px';
    messageInput.style.fontSize = minFontSize + 'px';
    sendButton.style.fontSize = minFontSize + 'px';

    var textblockHeight = Math.round(height * .03),
        textblockWidth = Math.round(width * .025);

    var mintextblockFontSize = Math.min(textblockHeight, textblockWidth);

    var pElements = document.getElementsByClassName('text-block');
    for (var x = 0; x < pElements.length; x++) {
        pElements[x].style.fontSize = mintextblockFontSize + 'px';
    }

    if (atBottom) {
        var chat = document.getElementById('chat');
        chat.scrollTop = chat.scrollHeight;
    }
}

function sendMessage() {
    var user = usernameInput.value,
        msg = messageInput.value;

    if (user.match('\\w') === null || msg === '')
        return;

    user = user.trim();

    socket.emit('chat-message', {
        username: user,
        message: msg
    });
    messageInput.value = '';
}

// event listeners
window.addEventListener('resize', function () {
    reset();
});

sendButton.addEventListener('click', function () {
    var user = usernameInput.value,
        msg = messageInput.value;
    sendMessage();
});

messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

socket.on('chat-message', function (data) {
    var chat = document.getElementById('chat'),
        fontSize = 'font-size:' + Math.min(Math.round(height * .03), Math.round(width * .025)) + 'px;';
    atBottom = chat.scrollTop === (chat.scrollHeight - chat.offsetHeight);
    var date = new Date();
    var hours = date.getHours(),
        mins = date.getMinutes();
    var time = (hours < 10 ? '0' : '') + hours + ':' + (mins < 10 ? '0' : '') + mins;
    chat.innerHTML += '<p class="text-block" style="' + fontSize + '"><span style="color:gray;">' + time + '</span> <b style="color:#569cd6;">' + data.username + ':</b><span style="color:#ce9178;"> ' + data.message + '</span></p>';
    if (atBottom)
        chat.scrollTop = chat.scrollHeight;
});