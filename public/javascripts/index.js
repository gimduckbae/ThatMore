const g_apikey = "AIzaSyCAVuBoT61qOyselZeEQ6B3cDU-zJIKBPc"; // 우리집 가보
$(document).ready(function () {
    // 모바일 체크
    const md = new MobileDetect(navigator.userAgent);
    if (md.mobile() == null) {
        // PC 환경
    } else {
        // 모바일 환경
        $('#search-url-input').css("font-size", "3.5vw");
        $('#search-button').css("font-size", "3.5vw");
        $('#search_btn_drop').css("width", "20vw");
        $('#search_btn_drop').css("font-size", "3.5vw");
        $('#search_btn_drop').css("padding", "0");
        $('.footer-text').find('span').css("margin-top", "16px");
    }

    // 검색버튼
    $("#search-button").click(function () {
        $("#accordionFlushExample").empty(); // 기존에 있던 동영상 리스트 삭제
        $('.spinner-box').css("display", "flex"); // 검색버튼 누르면 스피너 표시
        $('.main-box').css("display", "none"); // 검색버튼 누르면 That More + 숨기기
        // css 대기
        setTimeout(function () {
            search_button_handler();
        }, 1);
    });

    $("#search-url-input").keypress(function (e) {
        if (e.which == 13) {
            $("#accordionFlushExample").empty(); // 기존에 있던 동영상 리스트 삭제
            $('.spinner-box').css("display", "flex"); // 검색버튼 누르면 스피너 표시
            $('.main-box').css("display", "none"); // 검색버튼 누르면 That More + 숨기기
            // css 대기
            setTimeout(function () {
                search_button_handler();
            }, 1);
        }
    });

    // Swal 로 팝업창 띄우기 수정중-----------------------------------
    // $("#search-url-input").focus(function () {
    //     popup_swal();
    // });

    // accordion-button 버튼 핸들러
    $("#accordionFlushExample").on("click", ".accordion-button", accordion_button_handler);

    // Top 스크롤 버튼
    $("#btn_top").click(function () {
        $('html, body').animate({
            scrollTop: $("body").offset().top
        }, 500);
    });

    // Down 스크롤 버튼
    $("#btn_down").click(function () {
        $('html, body').animate({
            scrollTop: $("footer").offset().top
        }, 500);
    });

    // 검색옵션 버튼
    $('#search_type_1').click(function () {
        $('#search-url-input').attr('placeholder', '영상 URL 입력');
        $('#search_btn_drop').text('영상URL');
    });

    $('#search_type_2').click(function () {
        $('#search-url-input').attr('placeholder', '예시) 조코딩');
        $('#search_btn_drop').text('채널명');
    });
});

// 팝업창 띄우기
function popup_swal() {
    return;
    $("#search-url-input").blur();
    if (popup_check() == false) {
        Swal.fire({
            title: '댓글모아',
            text: '혹시 몰라 가이드를 준비해 봤어요!',
            footer: '<a href=""><strong>사용 가이드 보러가기</strong></a>',
            icon: 'question',
            allowOutsideClick: false,
            showCloseButton: true,
            showconfirmButton: false,
            closeButtonHtml: 
            `
            <button class="">닫기</button>
            <button class="">닫기</button>
            `,
            showCancelButton: false,
        }).then((result) => {
            const is_confirm = result.isConfirmed;
            const is_cancel = result.isDismissed;
            const is_dismiss = result.isDismissed;
        });
    }
}


// 팝업창 체크
function popup_check() {
    if (document.cookie.indexOf('p_visit_check') != -1) {
        return true;
    } else {
        return false;
    }
    // const date = new Date();
    // date.setHours(date.getHours() + 24);
    // document.cookie = `p_visit_check=true; expires=${date.toUTCString()}; secure}`;
}

/** 아코디언 버튼 이벤트 핸들러 */
function accordion_button_handler() {
    if (this.ariaChecked == "false") {
        this.ariaChecked = "true";

        // 비디오ID (댓글 추출할때 필요)
        const videoId = this.ariaLabel;

        // 댓글 추출
        const commentThreads_XHR = get_comment_threads_from_video_id(videoId);

        // 댓글 테이블 추가할 ele 위치
        const $selectEle = $(this).parent().parent().find('.accordion-body');

        commentThreads_XHR.then(function (jsonData) {
            // 댓글 테이블 추가하는 반복문 함수 넣을자리
            add_comment_to_html(jsonData, $selectEle);

        }).fail(function (response) {
            Swal.fire({
                icon: 'error',
                title: '일시적인 오류가 발생했어요.',
                text: '잠시 후 다시 이용해주세요.',
            })
            // console.log("댓글쓰레드 요청 실패");
            this.ariaChecked = "false";
            this.addClass("collapsed");
            this.parent().next().removeClass("show");

        }).done(function (data) {
        });
    }
}


/** 검색버튼 이벤트 핸들러 */
function search_button_handler() {
    const inputElement = $("#search-url-input");
    const inputString = inputElement.val();
    const btnString = $('#search_btn_drop').text();


    if (btnString == '영상검색') {
        const videoId = get_video_id(inputString);

        if (videoId == "") {
            Swal.fire({
                icon: 'error',
                title: '링크가 잘못 됐어요!',
                text: '동영상 URL을 다시 확인해주세요.',
            })
            $('.main-box').css("display", "flex"); // 메인화면 That More + 표시
            $('.spinner-box').css("display", "none");  // 스피너 숨기기
            return;
        }

        // 비디오URL로 채널ID찾기
        const channelId_XHR = get_channel_id_from_video_id(videoId);

        channelId_XHR.then(function (jsonData) {
            const channelTitle = jsonData.items[0].snippet.channelTitle;
            const channelId = jsonData.items[0].snippet.channelId;
            const playlistId = channelId.replace("UC", "UU");

            // 채널ID의 업로드된 비디오리스트ID로 동영상리스트 추출
            const video_list_XHR = get_video_list_from_playlist_id(playlistId);
            return video_list_XHR;
        }).fail(function (response) {
            Swal.fire({
                icon: 'error',
                title: '일시적인 오류가 발생했어요.',
                text: '잠시 후 다시 이용해주세요.',
            })
        }).done(function (data) {
            add_video_list_to_html(data);
        });

    } else if (btnString == '채널검색') {
        try {
            const channelName = inputString;
            const channelId = get_channel_id_from_name(channelName).responseJSON.channel_id;
            const playlistId = channelId.replace("UC", "UU");
            console.log(playlistId);
            const video_list_XHR = get_video_list_from_playlist_id(playlistId).responseJSON;
            add_video_list_to_html(video_list_XHR);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: '일시적인 오류가 발생했어요.',
                text: '잠시 후 다시 이용해주세요.',
            })
        }
    }
    $('.spinner-box').css("display", "none"); // 스피너 숨기기
}


/** 이름으로 채널ID 추출하는 함수 */
function get_channel_id_from_name(searchName) {
    const jqXHR = $.ajax({
        type: "GET",
        dataType: "JSON",
        url: `${window.location.href}api/getchannel/${searchName}`,
        async: false,
        contentType: "application/json",
    });
    return jqXHR;
}


/**입력받은 동영상URL 가공하는 함수*/
function get_video_id(videoURL) {
    if (videoURL.indexOf("youtu.be") != -1) {
        videoId = videoURL.split("/")[3];
    } else if (videoURL.indexOf("watch?v=") != -1) {
        videoId = videoURL.split("v=")[1];
    } else {
        videoId = "";
    }
    return videoId;
}


/**동영상URL로 채널ID추출하는 함수 */
function get_channel_id_from_video_id(videoId) {
    const jqXHR = $.ajax({
        type: "GET",
        dataType: "JSON",
        url: `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${g_apikey}`,
        async: false,
        contentType: "application/json",
    });
    return jqXHR;
}


/**플레이리스트ID로 동영상리스트 추출하는 함수 */
function get_video_list_from_playlist_id(playlistId) {
    const video_list_XHR = $.ajax({
        type: "GET",
        dataType: "JSON",
        url: `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,id,contentDetails&playlistId=${playlistId}&maxResults=50&key=${g_apikey}`,
        async: false,
        contentType: "application/json",
    });
    return video_list_XHR;
}


/**동영상리스트를 html에 추가하기 */
function add_video_list_to_html(video_list_XHR) {
    console.log(video_list_XHR);
    const video_list = video_list_XHR.items;
    for (let i = 0; i < video_list.length; i++) {
        const videoId = video_list[i].contentDetails.videoId;
        const videoTitle = video_list[i].snippet.title;
        const videoThumbnail = video_list[i].snippet.thumbnails.medium.url;
        const videoPublishedAt = video_list[i].snippet.publishedAt;
        const videoDescription = video_list[i].snippet.description;
        const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
        const videoHTML = `
        <div class="accordion-item">
        <h2 class="accordion-header" id="flush-heading${videoId}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                data-bs-target="#flush-collapse${videoId}" aria-expanded="false" aria-checked="false" aria-controls="flush-collapse${videoId}" aria-label="${videoId}">
                <img src="${videoThumbnail}" class="rounded float-start"
                    alt="..." style="width: 20%;">
                <p class="lead" style="margin: 0 auto;">${videoTitle}</p>
            </button>
        </h2>
        <div id="flush-collapse${videoId}" class="accordion-collapse collapse" aria-labelledby="flush-heading${videoId}"
            data-bs-parent="#accordionFlushExample">
            <div class="accordion-body">
                <a href="${videoURL}" target="_blank"
                    class="btn btn btn-danger mb-3" style="width: 100%;">유튜브 바로가기</a>
            </div>
        </div>
    </div>
        `;
        $("#accordionFlushExample").append(videoHTML);
    }
}


/** 비디오ID에서 댓글쓰레드 가져오기 */
function get_comment_threads_from_video_id(videoId) {
    const commentThreads_XHR = $.ajax({
        type: "GET",
        dataType: "JSON",
        url: `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&textFormat=plainText&order=relevance&maxResults=100&videoId=${videoId}&key=${g_apikey}`,
        async: false,
        contentType: "application/json",
    });
    // console.log("댓글 요청 성공");
    // console.log(commentThreads_XHR);
    return commentThreads_XHR;
}


/** API로 댓글리스트 가져와서 html에 추가하기 */
function add_comment_to_html(commentThreads_XHR, jqElement) {
    const commentThreads = commentThreads_XHR.items;
    let commentFirst = `
    <section class="mb-5">
    <div class="card bg-light">
        <div class="card-body" style="background-color: rgb(250, 250, 250);">
    `;
    let commentLast = `
    </div>
    </div>
    </section>
    `;
    let commentMiddle = ``;

    // 댓글 목록 html 이어붙히는 for문
    for (let i = 0; i < commentThreads.length; i++) {
        const comment = commentThreads[i].snippet.topLevelComment.snippet.textDisplay;
        const likeCount = commentThreads[i].snippet.topLevelComment.snippet.likeCount;
        const authorDisplayName = commentThreads[i].snippet.topLevelComment.snippet.authorDisplayName;
        const authorProfileImageUrl = commentThreads[i].snippet.topLevelComment.snippet.authorProfileImageUrl;

        // 댓글 목록 html 이어붙히는거
        commentMiddle += `
        <div class="d-flex mb-5">
        <div class="flex-shrink-0" style="padding-right: 15px; padding-top: 5px;">
            <img class="rounded-circle" src="${authorProfileImageUrl}"
                alt="..." />
        </div>
        <div>
            <div class="fw-bold">${authorDisplayName} <span class="badge rounded-pill bg-danger">🤍 ${likeCount}</span>
            </div>
            ${comment}
        </div>
    </div>
        `
    }
    const commentHTML = commentFirst + commentMiddle + commentLast;
    jqElement.append(commentHTML); // 슈우우우우우웃
    return commentHTML;
}