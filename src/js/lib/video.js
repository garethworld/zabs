window.video = function () {
  var video = document.getElementById('video');
  var videoSrc = document.getElementById('video-src');
  return {
    play(e) {
      e.preventDefault();
      video.classList.remove('hidden');
      videoSrc.currentTime = 0;
      videoSrc.play();
    },
    close(e) {
      e.preventDefault();
      video.classList.add('hidden');
      videoSrc.currentTime = 0;
      videoSrc.pause();
    },
  };
};
