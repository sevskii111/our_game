$(document).ready(() => {
    $('html').css('cursor', 'pointer');
    $('html').click(function (e) {
        $.get('/clicked', (res) => {
            if (!res.success)
            {
                $('body').css('background', 'radial-gradient(#000011, #455A64)');
                setTimeout(() => {
                    $('body').css('background', 'radial-gradient(#0000FF, #0000A0)');
                }, res.timeout);
            }
        });
    });


    setInterval(() => {
        $.get('/status', (data) => {
            let {
                questionText
            } = data;
            if (questionText) {
                $('.currQuestion-text').text(questionText);
                $('.currQuestion').removeClass('hidden');
            } else {
                $('.currQuestion').addClass('hidden');
            }
        });
    }, 2000);
});