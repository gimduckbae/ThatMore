$(document).ready(function () {
    // PC 가이드로 스크롤
    $("#btn_pc").click(function () {
        $('html, body').animate({
            scrollTop: $("#scroll_pc").offset().top
        }, 500);
        $('body').focus();
    });


    // 모바일 가이드로 스크롤
    $("#btn_mobile").click(function () {
        $('html, body').animate({
            scrollTop: $("#scroll_mobile").offset().top
        }, 500);
    });

});