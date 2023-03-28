const g_apikey = "AIzaSyCAVuBoT61qOyselZeEQ6B3cDU-zJIKBPc";
$(document).ready(function () {

    // 검색버튼
    $("#search-button").click(search_button_handler);
});


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
        const uploadListId = channelId.replace("UC", "UU");
        console.log("채널명 : " + channelTitle);
        console.log("채널ID : " + channelId);
        console.log("업로드리스트ID : " + uploadListId);

        const video_list_XHR = get_video_list_from_channel_id(uploadListId);
        return video_list_XHR;

    }).fail(function (response) {
        console.log("유튜브 요청 실패");
        console.log(response);
    }).done(function (data) {
        console.log("유튜브 요청 완료");
        console.log(data);
    });
}



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


function get_video_list_from_channel_id(uploadListId) {
    const video_list_XHR = $.ajax({
        type: "GET",
        dataType: "JSON",
        url: `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadListId}&key=${g_apikey}`,
        async: false,
        contentType: "application/json",
    });
    return video_list_XHR;
}


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