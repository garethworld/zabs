window.vhfix = function () {
  return {
    init(e) {
      var fullHelem = document.getElementsByClassName('full-height');

      window.onresize = function (event) {
        setFullHeight();
      };
      setFullHeight();

      function setFullHeight() {
        viewHeight = Math.max(
          document.documentElement.clientHeight || 0,
          window.innerHeight || 0,
        );
        for (var i = 0; i < fullHelem.length; i++) {
          fullHelem[i].style.height = viewHeight + 'px';
        }
      }
    },
  };
};
