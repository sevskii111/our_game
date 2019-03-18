$(document).ready(() => {
    const socket = io();
    socket.emit('handshake', 'hello');
});