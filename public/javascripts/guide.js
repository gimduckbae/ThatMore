$(document).ready(function () {
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
});