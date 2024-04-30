import Splide from '@splidejs/splide';

window.gallery = function () {
  var productGallery = document.getElementById('product-gallery');
  return {
    init() {
      var main = new Splide('#product-gallery', {
        type: 'fade',
        rewind: true,
        pagination: false,
        arrows: false,
        drag: true,
      });

      var thumbnails = new Splide('#product-thumb-nav', {
        fixedWidth: 90,
        fixedHeight: 90,
        gap: 10,
        rewind: true,
        pagination: false,
        isNavigation: true,
        breakpoints: {
          900: {
            fixedWidth: 55,
            fixedHeight: 55,
          },
        },
      });
      main.on('click', function () {
        main.go('>');
      });

      main.sync(thumbnails);
      main.mount();
      thumbnails.mount();
    },
  };
};
