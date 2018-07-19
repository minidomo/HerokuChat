var socket = io.connect('https://socket-io-test-chat.herokuapp.com/');

var width = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

var height = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

console.log(width + ' ' + height);

var boxDiv = document.getElementById('box');
boxDiv.style.height = height + 'px';

var usernameInput = document.getElementById('username');
var messageInput = document.getElementById('message');
var sendButton = document.getElementById('send');

usernameInput.style.fontSize = Math.round(height * .04) + 'px';
messageInput.style.fontSize = Math.round(height * .04) + 'px';
sendButton.style.fontSize = Math.round(height * .04) + 'px';

// var test = document.getElementById('test');
// test.style.fontSize = height * .03 + 'px';
// test.style.paddingLeft = width / 90 + 'px';

var sendMessage = function () {
    var user = usernameInput.value,
        msg = messageInput.value;

    if (user.match('\\w') !== null)
        return;

    user = user.trim();

    socket.emit('chat-message', {
        username: user,
        message: msg
    });
    messageInput.value = '';
}

// event listeners
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
        fontSize = 'font-size:' + Math.round(height * .03) + 'px;',
        paddingLeft = 'padding-left:' + Math.round(width / 90) + 'px;',
        atBottom = chat.scrollTop === (chat.scrollHeight - chat.offsetHeight);
    var date = new Date();
    var hours = date.getHours(),
        mins = date.getMinutes();
    var time = (hours < 10 ? '0' : '') + hours + ':' + (mins < 10 ? '0' : '') + mins;
    chat.innerHTML += '<p style="' + fontSize + paddingLeft + '"><span style="color:gray;">' + time + '</span> <b style="color:#569cd6;">' + data.username + ':</b><span style="color:#ce9178;"> ' + data.message + '</span></p>';
    if (atBottom)
        chat.scrollTop = chat.scrollHeight;
});