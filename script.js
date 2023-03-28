$(document).ready(function () {
    const apikey = "AIzaSyCAVuBoT61qOyselZeEQ6B3cDU-zJIKBPc";

    // 검색버튼
    $("#search-button").click(function () {
        var videoURL = $("#query").val();
        var channelTitle = "";
        var channelId = "";
        var uploadListId = "";

        if (videoURL.indexOf("youtu.be") != -1) {
            videoURL = videoURL.split("/")[3];
        } else if (videoURL.indexOf("watch?v=") != -1) {
            videoURL = videoURL.split("v=")[1];
        } else {
            alert("유효하지 않은 URL입니다.");
            return;
        }
        
        // 비디오URL로 채널ID찾기
        $.ajax({
            type: "GET",
            dataType: "JSON",
            url: `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoURL}&key=${apikey}`,
            contentType: "application/json",
            success: function (jsonData) {
                console.log(jsonData);
                channelTitle = jsonData.items[0].snippet.channelTitle;
                channelId = jsonData.items[0].snippet.channelId;
                uploadListId = channelId.replace("UC", "UU"); // 채널ID -> 업로드목록ID

                console.log("채널명 : " + channelTitle);
                console.log("채널ID : " + channelId);
                console.log("업로드목록ID : " + uploadListId);
            },
            complete: function (data) {
            },
            error: function (xhr, status, error) {
                console.log("유튜브 요청 에러: " + error);
            }
        })
        
        // 최근영상목록 가져오기 << 수정해야함
        $.ajax({
            type: "GET",
            dataType: "JSON",
            url: `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadListId}&key=${apikey}`,
            contentType: "application/json",
            success: function (jsonData) {
                console.log(jsonData);
                
            },
            complete: function (data) {
            },
            error: function (xhr, status, error) {
                console.log("유튜브 요청 에러: " + error);
            }
        })



    });


});



// 3. Channels & PlaylistItems

// part 에 contentDetails 를 넣고, id 에 channelId 를 넣고, 쿼리를 날리면, relatedPlaylists 를 가져올 수 있다.
// likes, uploads 등의 값이 있는데, 이 중에서 uploads 가 해당 채널에 업로드된 모든 동영상들의 playlist 이다.
// 쿼리 비용은 3 에 불과하다.

// 이 playlistId 를 PlaylistItems:list method 의 매개변수 playlistId 에 넣고 part = snippet 으로 쿼리를 날리면,
// 해당 채널에 업로드된 모든 동영상의 목록을 얻을 수 있다.
// 이 쿼리 비용도 3 에 불과하다.