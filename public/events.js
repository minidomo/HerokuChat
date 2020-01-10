const Events = {
    CHAT: {
        USER: {
            JOIN: 'chat-user-join',
            DISCONNECTED: 'chat-user-disconnected',
            MESSAGE: {
                SEND: 'chat-user-message-send',
                RECEIVE: 'chat-user-message-receive',
            }
        }
    },
    SYSTEM: {
        USER: {
            SIZE_DISPLAY: 'system-user-size_display',
            DISCONNECT: 'disconnect',
        },
        JOIN: {
            REQUEST: 'system-join-request',
            FAILED: 'system-join-fail',
            SUCCESS: 'system-join-success',
        }
    }
};
Object.freeze(Events);