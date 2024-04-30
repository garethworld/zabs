import Splide from '@splidejs/splide';

window.sauces = function () {
  return {
    init() {
      var sauceGallery = new Splide(this.$el, {
        type: 'loop',
        rewind: false,
        pagination: false,
        arrows: true,
        drag: true,
      });
      sauceGallery.mount();
    },
  };
};
