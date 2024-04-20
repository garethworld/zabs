import { tns } from 'tiny-slider/src/tiny-slider';
var slider;
window.slides = function () {
  return {
    hover(e) {
      var slide = e.target.getAttribute('data-index');
      var slideNum = parseInt(slide - 1);
      slider.goTo(slideNum);
    },

    out(e) {
      slider.goTo(0);
    },

    init(e) {
      slider = tns({
        container: '.slides',
        items: 1,
        slideBy: 'page',
        mode: 'gallery',
        nav: false,
        controls: false,
        speed: 1000,
        autoplayTimeout: 4000,
        autoplay: true,
        autoplayButtonOutput: false,
        responsive: {
          640: {
            autoplay: false,
          },
        },
      });
    },
  };
};
