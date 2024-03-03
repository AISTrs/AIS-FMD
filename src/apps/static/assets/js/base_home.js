document.addEventListener('DOMContentLoaded', function () {
    var nav = document.getElementById('base-nav-layout');

    var navTextElements = document.querySelectorAll('.nav-text');

    nav.addEventListener('mouseenter', function () {
        navTextElements.forEach(function (element) {
            element.style.opacity = '1';
        });
    });

    nav.addEventListener('mouseleave', function () {
        navTextElements.forEach(function (element) {
            element.style.opacity = '0';
        });
    });
});