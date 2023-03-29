const g_apikey = "AIzaSyCAVuBoT61qOyselZeEQ6B3cDU-zJIKBPc";
$(document).ready(function () {
    // 검색버튼
    $("#search-button").click(search_button_handler);

    // accordion-button 버튼 핸들러
    $("#accordionFlushExample").on("click", ".accordion-button", accordion_button_handler);
});


function accordion_button_handler() {
    if (this.ariaChecked == "false") {
        console.log("accordion-button 버튼 핸들러");
        console.log(this + "클릭됨");
        this.ariaChecked = "true";

        // 비디오ID (댓글 추출할때 필요)
        const videoId = this.ariaLabel;

        // 댓글 추출
        const commentThreads_XHR = get_comment_threads_from_video_id(videoId);

        commentThreads_XHR.then(function (jsonData) {
            console.log("유튜브 요청 성공");
            console.log(jsonData);

            // 댓글 테이블 추가하는 반복문 함수 넣을자리
            add_comment_to_html(jsonData);


            // 댓글 테이블 추가할 ele 위치
            const $selectEle = $(this).parent().parent().find('.accordion-body');

        }).fail(function (response) {
            console.log("유튜브 요청 실패");
            console.log(response);
        }).done(function (data) {
            console.log("유튜브 요청 완료");
            console.log(data);
        });
    }
}


function search_button_handler() {
    const videoURL = $("#search-url-input").val();
    const videoId = get_video_id(videoURL);
    if (videoId == "") {
        alert("유효한 URL이 아닙니다.");
        return;
    }

    // 비디오URL로 채널ID찾기
    const channelId_XHR = get_channel_id_from_video_id(videoId);

    channelId_XHR.then(function (jsonData) {
        console.log("유튜브 요청 성공");
        console.log(jsonData);
        const channelTitle = jsonData.items[0].snippet.channelTitle;
        const channelId = jsonData.items[0].snippet.channelId;
        const playlistId = channelId.replace("UC", "UU");
        console.log("채널명 : " + channelTitle);
        console.log("채널ID : " + channelId);
        console.log("업로드된 플레이리스트ID : " + playlistId);

        // 플레이리스트ID로 동영상리스트 추출
        const video_list_XHR = get_video_list_from_playlist_id(playlistId);
        return video_list_XHR;

        // const playlist_XHR = test(channelId);
        // return playlist_XHR;


    }).fail(function (response) {
        console.log("유튜브 요청 실패");
        console.log(response);
    }).done(function (data) {
        console.log("유튜브 요청 완료");
        console.log(data);
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


function get_comment_threads_from_video_id(videoId) {
    const commentThreads_XHR = $.ajax({
        type: "GET",
        dataType: "JSON",
        url: `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&textFormat=plainText&order=relevance&videoId=${videoId}&key=${g_apikey}`,
        async: false,
        contentType: "application/json",
    });
    console.log("댓글 요청 성공");
    console.log(commentThreads_XHR);
    return commentThreads_XHR;
}


function add_comment_to_html(commentThreads_XHR) {
    const commentThreads = commentThreads_XHR.items;
    let commentFirst = `<table class="table table-light table-striped table-hover">`;
    let commentLast = `</table>`;
    let commentMiddle = ``;

    for (let i = 0; i < commentThreads.length; i++) {
        const comment = commentThreads[i].snippet.topLevelComment.snippet.textDisplay;
        const likeCount = commentThreads[i].snippet.topLevelComment.snippet.likeCount;
        const authorDisplayName = commentThreads[i].snippet.topLevelComment.snippet.authorDisplayName;
        const authorProfileImageUrl = commentThreads[i].snippet.topLevelComment.snippet.authorProfileImageUrl;

        // 댓글 목록 html 이어붙히는거
        commentMiddle += `
        <tr>
            <th>
                <tb>
                    <h6><span class="badge rounded-pill text-bg-primary">${likeCount}👍</span> ${comment}</h6>
                </tb>
            </th>
        </tr>
        `

    }
}







// $selectEle.append(`
// <table class="table table-light table-striped table-hover">
// <tr>
//     <th>
//         <tb>
//             <h6><span class="badge rounded-pill text-bg-primary">1670👍</span> 오늘도 유익한 강의 잘
//                 들었습니다📦</h6>
//         </tb>
//     </th>
// </tr>
// <tr>
//     <th>
//         <h6><span class="badge rounded-pill text-bg-primary">621👍</span> 작년에 온 택배... 뜯는 방법을
//             몰라 아직도 못뜯고
//             있었는데 덕분에 오늘 택배를 뜯었습니다 항상 유익한 강의 감사드립니다</h6>
//     </th>
// </tr>
// <tr>
//     <th>
//         <h6><span class="badge rounded-pill text-bg-primary">152👍</span> 역시 정석은 다르네요 지금까지
//             운송장을 제대로 안때고
//             버려서 개인정보 유출 때문에 재산을 모두 잃었는데 조교님덕분에 운송장을 땔 수 있게 됐어요! 물론 택배를 받을 집이 없지만요</h6>
//     </th>
// </tr>
// </table>
// `);





{/* <table class="table table-light table-striped table-hover">
    <tr>
        <th>
            <tb>
                <h6><span class="badge rounded-pill text-bg-primary">1670👍</span> 오늘도 유익한 강의 잘
                    들었습니다📦</h6>
            </tb>
        </th>
    </tr>
    <tr>
        <th>
            <h6><span class="badge rounded-pill text-bg-primary">621👍</span> 작년에 온 택배... 뜯는 방법을
                몰라 아직도 못뜯고
                있었는데 덕분에 오늘 택배를 뜯었습니다 항상 유익한 강의 감사드립니다</h6>
        </th>
    </tr>
    <tr>
        <th>
            <h6><span class="badge rounded-pill text-bg-primary">152👍</span> 역시 정석은 다르네요 지금까지
                운송장을 제대로 안때고
                버려서 개인정보 유출 때문에 재산을 모두 잃었는데 조교님덕분에 운송장을 땔 수 있게 됐어요! 물론 택배를 받을 집이 없지만요</h6>
        </th>
    </tr>
</table> */}



// 1. 동영상URL로 채널ID 찾기 ㅇㅇ
// 2. 채널ID로 업로드된 플레이리스트ID 찾기 ㅇㅇ
// 3. 플레이리스트ID로 최근 동영상리스트 추출 ㅇㅇ
// 4. 동영상리스트에서 동영상ID 추출 -> playlistItems.items[i].contentDetails.videoId
// 5. 동영상ID로 댓글스레드 추출
// 6. 댓글스레드에서 댓글 추출
