$(document).ready(function () {
    // 모바일 체크
    const md = new MobileDetect(navigator.userAgent);
    if (md.mobile() == null) {
        // PC 환경
    } else {
        // 모바일 환경
        $(".page_title").css("font-size", "8vw");
        $(".my_font2").css("font-size", "4vw");
    }


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