$(document).ready(function () {
    $("#btn_pc").click(function () {
        document.querySelector('#scroll_pc').scrollIntoView({ behavior: 'smooth' });
        $('body').focus();
    });

    $("#btn_mobile").click(function () {
        document.querySelector('#scroll_mobile').scrollIntoView({ behavior: 'smooth' });
    });

});