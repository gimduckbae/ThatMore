const g_apikey = "AIzaSyCAVuBoT61qOyselZeEQ6B3cDU-zJIKBPc"; // 우리집 가보
$(document).ready(function () {
    // 검색버튼
    $("#search-button").click(search_button_handler);

    // accordion-button 버튼 핸들러
    $("#accordionFlushExample").on("click", ".accordion-button", accordion_button_handler);

    // Top 스크롤 버튼
    $("#btn_top").click(function () {
        document.querySelector('body').scrollIntoView({ behavior: 'smooth' });
        $('body').focus();
    });

    // Down 스크롤 버튼
    $("#btn_down").click(function () {
        document.querySelector('footer').scrollIntoView({ behavior: 'smooth' });
    });
});


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
        console.log($selectEle);

        commentThreads_XHR.then(function (jsonData) {
            // 댓글 테이블 추가하는 반복문 함수 넣을자리
            add_comment_to_html(jsonData, $selectEle);

        }).fail(function (response) {
            swal("일시적인 오류가 발생했어요.", "잠시 후 다시 이용해주세요.", "error");
            // console.log("댓글쓰레드 요청 실패");
            // console.log(response);
        }).done(function (data) {
            // console.log(data);
        });
    }
}


/** 검색버튼 이벤트 핸들러 */
function search_button_handler() {
    const videoURL = $("#search-url-input").val();
    const videoId = get_video_id(videoURL);
    if (videoId == "") {
        swal("링크가 잘못 됐어요!", "동영상 URL을 다시 확인해주세요.", "error");
        return;
    }

    // 기존에 있던 동영상 리스트 삭제
    $("#accordionFlushExample").empty();

    // 검색버튼 누르면 메인화면 That More + 숨기기
    $(".main-box").css("display", "none");

    // 비디오URL로 채널ID찾기
    const channelId_XHR = get_channel_id_from_video_id(videoId);

    channelId_XHR.then(function (jsonData) {
        const channelTitle = jsonData.items[0].snippet.channelTitle;
        const channelId = jsonData.items[0].snippet.channelId;
        const playlistId = channelId.replace("UC", "UU");

        // 비디오리스트ID로 동영상리스트 추출
        const video_list_XHR = get_video_list_from_playlist_id(playlistId);
        return video_list_XHR;
    }).fail(function (response) {
        swal("일시적인 오류가 발생했어요.", "잠시 후 다시 이용해주세요.", "error");
        // console.log("채널ID 요청 실패");
        // console.log(response);
    }).done(function (data) {
        add_video_list_to_html(data);
    });
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
    console.log("댓글 요청 성공");
    console.log(commentThreads_XHR);
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