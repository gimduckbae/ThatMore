$(document).ready(function () {
    // 디버깅용 쿠키삭제
    // document.cookie = "c_visit_check=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    const socket = io();
    const chatForm = document.getElementById('chat-form');
    const chatBox = document.getElementById('messages');

    let last_other_name = '';
    let name = '';
    let g_input_error_count = 0;
    input_name();

    // 채팅 닉네임 설정
    function input_name() {
        Swal.fire({
            title: '<div style="font-size: x-large;">닉네임을 정해주세요.</div>',
            input: 'text',
            confirmButtonText: '<div style="font-size: large;">드가자~</div>',
        }).then((result) => {
            const is_empty = result.value == null || result.value == "";
            const is_confirm = result.isConfirmed;

            if (is_empty) {
                g_input_error_count++;
                const alert_message = g_input_error_count >= 3 ? `<div style="font-size: x-large;">설마 글씨를 못 읽는건 아니죠?</div>` : `<div style="font-size: x-large;">닉네임을 정해주세요.</div>`;
                Swal.fire(alert_message).then((result) => {
                    input_name();
                });
            }
            else if (result.value.length > 10) {
                g_input_error_count++;
                const alert_message = g_input_error_count >= 3 ? `<div style="font-size: x-large;">너무 길어요!</div>` : `<div style="font-size: x-large;">닉네임을 정해주세요.</div>`;
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


    // 쿠팡 광고 팝업
    function coopang_popup() {
        Swal.fire({
            title: '쿠팡 방문하고 채팅하기',
            text: '이 팝업은 쿠팡 파트너스 활동으로, 일정액의 수수료를 제공받을 수 있습니다.',
            icon: 'warning',
            footer: '<div style="text-align: center; font-size: smaller;"><strong>이 경고는 결제 유도가 아닙니다!</strong><br>클릭 한번으로 That More 운영에 큰 힘이 됩니다.</div>',
            confirmButtonText: '<div style="font-size: larger;">까짓거 해줄게!</div>',
            showCancelButton: true,
            cancelButtonText: '<div style="font-size: larger;">내가 왜 함?</div>'
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
    }


    // 채팅 전송 이벤드리스너, 쿠팡 체크
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = e.target.m.value

        if (coopang_check() == false) { // 쿠팡 쿠키가 없으면 광고 팝업
            coopang_popup();
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
        last_other_name = msg.name;
        socket.emit('chat message', msg);
        e.target.m.value = '';
        chatBox.appendChild(makeMessage(msg, false));
        chatBox.scrollTop = chatBox.scrollHeight;
    })


    // 다른사람의 채팅 메세지 수신
    socket.on('chat message', (message) => {
        chatBox.appendChild(makeMessage(message, true));
        chatBox.scrollTop = chatBox.scrollHeight;
    })


    // 메세지 html 생성
    const makeMessage = (message, isOthers) => {
        const mainClass = isOthers ? 'others-message-wrapper' : 'my-message-wrapper';
        const msgBox = document.createElement('div');
        msgBox.classList.add(mainClass);

        if (!isOthers) { // 내 메세지면 닉네임 출력 X
            msgBox.innerHTML = `
            <div class="my-message-box">
                <span style="font-size: medium;">${message.text}</span>
            </div>
            `;
        }
        else { // 다른사람 메세지면 닉네임 출력 O
            msgBox.innerHTML = `
            <span class="others-nickname" style="font-size: large; font-weight: bold;">${message.name}</span>
            <div class="others-message-box">
                <span style="font-size: medium;">${message.text}</span>
            </div>
                
            `;
        }
        return msgBox;
    }


    // 쿠팡 체크
    function coopang_check() {
        if (document.cookie.indexOf('c_visit_check') != -1) { // 쿠키 있으면 true
            return true;
        } else {
            return false;
        }
    }
});