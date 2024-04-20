window.video = function () {
  return {
    play(e) {
      e.preventDefault();

      var videoSrc = e.target.getAttribute('data-target');
      var videoSrc = document.getElementById(videoSrc);
      videoSrc.currentTime = 0;
      videoSrc.controls = true;
      videoSrc.play();

      e.target.classList.add('hidden');
    },
  };
};
