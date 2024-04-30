window.hero = function () {
  return {
    init() {
      var screenH = window.innerHeight * 0.75;
      this.$el.style.height = screenH + 'px';
    },
  };
};
