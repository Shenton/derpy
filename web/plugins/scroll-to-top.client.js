$(window).scroll(function() {
    if ($(this).scrollTop() < 100) $('.scroll-to-top').fadeOut();
    else $('.scroll-to-top').fadeIn();
});
