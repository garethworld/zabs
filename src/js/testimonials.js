import Splide from '@splidejs/splide';

window.testimonials = function () {
  return {
    init() {
      var tests = new Splide(this.$el, {
        type: 'loop',
        rewind: false,
        pagination: false,
        arrows: true,
        drag: true,
      });
      tests.mount();
    },
  };
};
