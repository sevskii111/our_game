$(document).ready(() => {
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
        showQuestion = (text) => {
            state = 1;
            $('.page').addClass('hidden');
            $.post('/ask', {
                    text
                },
                () => {
                    $('.currQuestion-text').text(text);
                    $('.currQuestion').removeClass('hidden');
                });
        },
        enableQueue = () => {
            $.get('/queue', () => {
                $('body').css('background', 'radial-gradient(#0000FF, #FFA726)');
            });
        },
        hideQuestion = () => {
            $.get('/close', () => {
                state = 0;
                $('.currQuestion').addClass('hidden');
                $('body').css('background', 'radial-gradient(#0000FF, #0000A0)');
                showPage(currPage);
            });
        }

    showPage(currPage);
    $(window).keydown(function (e) {
        let code = e.originalEvent.code;
        if (state == 0) {
            if (code == "ArrowDown") {
                currPage = Math.min(currPage + 1, 3);
            } else {
                currPage = Math.max(currPage - 1, 1);
            }
            showPage(currPage);
        } else {
            if (code == "Escape") {
                hideQuestion();
            } else if (code == 'Space') {
                enableQueue();
            }
        }
        console.log(code);
    });

    $('.question').click(function () {
        showQuestion($(this).attr('text'));
        $(this).addClass('opened');
    });

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
});