window.youtube = function () {
  return {
    play(e) {
      var parent = e.target;
      var video = document.createElement('iframe');
      var id = e.target.getAttribute('data-id');
      var played = e.target.getAttribute('data-played');

      if (played == 'false') {
        video.setAttribute(
          'src',
          'https://www.youtube.com/embed/' +
            id +
            '?autoplay=1&rel=0&modestbranding=1&autohide=1&color=white',
        );

        video.setAttribute('frameborder', '0');
        video.setAttribute('allowfullscreen', '1');
        video.setAttribute('allow', 'autoplay');
        video.classList.add('w-full');

        parent.appendChild(video);

        e.target.querySelector('.vid-play').classList.add('hidden');
        e.target.querySelector('.vid-thumb').classList.add('hidden');

        played = 'true';
      }
    },
  };
};
