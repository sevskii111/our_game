$(document).ready(() => {
    var socket = io();
    //Admin part
    let state = 0;
    /*
        0 - questions list
        1 - active question
    */
    let currPage = 1;
    const showPage = (index) => {
            $('.page').addClass('hidden');
            $(`.page[pageInd=${index}]`).removeClass('hidden');
        },
        showQuestion = (question, answer = false) => {
            if (answer) {
                $('.currQuestion-queue').addClass('hidden');
            } else {
                $('.currQuestion-queue').removeClass('hidden');
            }
            state = 1;
            const q = answer ? 'a' : 'q';
            $('.page').addClass('hidden');
            $.post('/ask', {
                    text: question[q].text,
                    image: question[q].image,
                    audio: question[q].audio
                },
                (body) => {
                    $('.currQuestion-text').text(body.text || '');
                    if (!body.text) {
                        enableQueue();
                    }
                    if (body.image) {
                        $('.currQuestion-image').css('display', 'block');
                        $('.currQuestion-image').attr('src', `data:image/png;base64, ${body.image}`);
                    } else {
                        $('.currQuestion-image').css('display', 'none');
                    }
                    if (body.audio) {
                        var audio = $('.currQuestion-audio');
                        audio.css('display', 'block');
                        $.get('/audio', (data) => {
                            audio.append($(`<audio controls src="data:audio/ogg;base64, ${data}">`));
                            $('audio')[0].load();
                            //$('audio')[0].play();
                        });
                    }
                    $('.currQuestion').removeClass('hidden');
                });
        },
        enableQueue = () => {
            $.get('/queue', () => {
                $('body').css('background', 'radial-gradient(#0000FF, #FFA726)');
            });
        },
        hideQuestion = (callback = () => {}) => {
            $.get('/close', () => {
                state = 0;
                $('.currQuestion').addClass('hidden');
                $('body').css('background', 'radial-gradient(#0000FF, #0000A0)');

                if ($('audio').length > 0) {
                    $('audio')[0].pause();
                }


                $('.currQuestion-audio').html('');
                showPage(currPage);
                callback();
            });
        }

    showPage(currPage);
    let currQuestion = null;

    $(window).keydown(function (e) {
        let code = e.originalEvent.code;
        if (state == 0) {
            if (code == "ArrowDown") {
                currPage = Math.min(currPage + 1, 4);
            } else if (code == "ArrowUp") {
                currPage = Math.max(currPage - 1, 0);
            }
            showPage(currPage);
        } else {
            if (code == "Escape") {
                hideQuestion();
            } else if (code == 'Space') {
                enableQueue();
            } else if (code == 'KeyA') {
                hideQuestion(() => {
                    showQuestion(currQuestion, true);
                });
            }
            console.log(code);
        }
    });
    $('.question').click(function () {
        let question = JSON.parse($(this).attr('question'));
        currQuestion = question;
        showQuestion(question);
        $(this).addClass('opened');
    });

    socket.on('question', (q) => {
        console.log(q);
    });

    socket.on('queue', (queue) => {
        $('.currQuestion-queue').html('');
        for (let i = 0; i < queue.length; i++) {
            $('.currQuestion-queue').append($(`<div class='queue-member' style='background-color:${queue[i]}'></div>`));
        }
    });
    /*
    setInterval(() => {
        $.get('/status', (data) => {
            let {
                queue
            } = data;
            $('.currQuestion-queue').html('');
            for (let i = 0; i < queue.length; i++) {
                console.log(queue);
                $('.currQuestion-queue').append($(`<div class='queue-member' style='background-color:${queue[i]}'></div>`));
            }
        });
    }, 500);
    */
});