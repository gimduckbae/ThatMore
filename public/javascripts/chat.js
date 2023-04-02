$(document).ready(function () {
    const socket = io();
    const chatForm = document.getElementById('chat-form');
    const chatBox = document.getElementById('messages');


    let name = '';
    let g_input_error_count = 0;
    input_name();


    function input_name() {
        Swal.fire({
            title: '채팅 닉네임을 정해주세요.',
            input: 'text',
            confirmButtonText: '드가자~',
        }).then((result) => {
            const is_empty = result.value == null || result.value == "";
            const is_confirm = result.isConfirmed;

            if (is_empty) {
                g_input_error_count++;
                const alert_message = g_input_error_count >= 3 ? "설마 글씨를 못 읽는건 아니죠?" : "닉네임을 정해주세요.";
                Swal.fire(alert_message).then((result) => {
                    input_name();
                });
            }
            else if (result.value.length > 10) {
                g_input_error_count++;
                const alert_message = g_input_error_count >= 3 ? "너무 길어요. 10자 이내로!" : "다른 닉네임을 정해주세요.";
                Swal.fire(alert_message).then((result) => {
                    input_name();
                });
            }
            else {
                g_input_error_count = 0;
                name = result.value;
            }
        });
    }






    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = e.target.m.value

        if (coopang_check() == false) {
            Swal.fire({
                title: '쿠팡 방문하고 채팅하기',
                text: '쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.',
                icon: 'warning',
                footer: '클릭 한번으로 That More 운영에 큰 힘이 됩니다.',
                confirmButtonText: '까짓거 해줄게!',
                showCancelButton: true,
                cancelButtonText: '내가 왜 함?'
            }).then((result) => {
                if (result.isConfirmed) {
                    if (coopang_check()) {
                        return;
                    }
                    window.open('https://link.coupang.com/a/TOalj', '_blank');
                    const date = new Date();
                    date.setHours(date.getHours() + 12);
                    document.cookie = `c_visit_check=true; expires=${date.toUTCString()}; secure}`;
                }
            })
            return;
        }

        if (message == '' || message == null) { // 메세지가 '' 일때 return
            return;
        } else if (message.length > 350) { // 메세지가 350자 이상일때 return
            Swal.fire({
                title: '350자 내로 입력하세요!',
                text: '하고싶은 말이 많을 수 있죠.',
                icon: 'error',
                confirmButtonText: '확인'
            })
            return;
        }
        const msg = {
            'name': name,
            'text': message
        };
        socket.emit('chat message', msg);
        e.target.m.value = '';
        chatBox.appendChild(makeMessage(msg, false));
        chatBox.scrollTop = chatBox.scrollHeight;
    })

    socket.on('chat message', (message) => {
        chatBox.appendChild(makeMessage(message, true));
        chatBox.scrollTop = chatBox.scrollHeight;
    })

    const makeMessage = (message, isOthers) => {
        const mainClass = isOthers ? 'others-message-wrapper' : 'my-message-wrapper';
        const msgBox = document.createElement('div');
        msgBox.classList.add(mainClass);

        if (!isOthers) {
            msgBox.innerHTML = `
            <div class="my-message-box">
                <span>${message.text}</span>
            </div>
            `;
        }
        else {
            msgBox.innerHTML = `
            <span class="others-nickname">${message.name}</span>
            <div class="others-message-box">
                <span>${message.text}</span>
            </div>
                
            `;
        }
        return msgBox;
    }


    // 모바일 체크
    const md = new MobileDetect(navigator.userAgent);
    if (md.mobile() == null) {

    }

    // 쿠팡 체크
    function coopang_check() {
        if (document.cookie.indexOf('c_visit_check') != -1) {
            return true;
        } else {
            return false;
        }
    }
});


