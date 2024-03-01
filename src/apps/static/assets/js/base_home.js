document.addEventListener('DOMContentLoaded', function () {
    var nav = document.getElementById('base-nav-layout');

    var navTextElements = document.querySelectorAll('.nav-text');
    var contentDiv = document.getElementById('div-container-fluid-content')

    nav.addEventListener('mouseenter', function () {
        navTextElements.forEach(function (element) {
            element.style.opacity = '1';
        });
        contentDiv.style.left = '200px';
    });

    nav.addEventListener('mouseleave', function () {
        navTextElements.forEach(function (element) {
            element.style.opacity = '0';
        });
        contentDiv.style.left = '90px';
    });
});