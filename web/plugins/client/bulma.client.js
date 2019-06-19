// navbar burger
$('.navbar-burger').click(function() {
    $('.navbar-burger').toggleClass('is-active');
    $('.navbar-menu').toggleClass('is-active');
});

// dropdown
$('div.dropdown > div.dropdown-trigger > button').click(function() {
    $(this).parent().parent().toggleClass('is-active');
});