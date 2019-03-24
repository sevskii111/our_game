$(document).ready(() => {
    var socket = io();
    $('html').css('cursor', 'pointer');
    $('html').click(function (e) {
        $.get('/clicked', (res) => {
            if (!res.success) {
                $('body').css('background', 'radial-gradient(#000011, #455A64)');
                setTimeout(() => {
                    $('body').css('background', 'radial-gradient(#0000FF, #0000A0)');
                }, res.timeout);
            }
        });
    });

    socket.on('question', (body) => {
        $('.currQuestion-text').text(body.text);
        if (body.image) {
            $('.currQuestion-image').css('display', 'block');
            $('.currQuestion-image').attr('src', `data:image/png;base64, ${body.image}`);
        } else {
            $('.currQuestion-image').css('display', 'none');
        }
        $('.currQuestion').removeClass('hidden');
    });

    var startTime = null;

    socket.on('check', (time) => {
        if (!startTime) {
            startTime = time;
        } else if (startTime != time) {
            document.location.reload(true);
        }
    });
});