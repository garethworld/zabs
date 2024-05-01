import { gsap } from 'gsap';
window.menu = function () {
  const menu = document.getElementById('mobile-menu');

  return {
    open(e) {
      menu.style.height = window.innerHeight + 'px';
      menu.classList.remove('hidden');
      // set body height to prevent scrolling
      document.body.style.height = window.innerHeight + 'px';
      document.body.classList.add('overflow-hidden');

      gsap.set('#mobile-menu', {
        x: '100%',
      });

      gsap.to('#mobile-menu', {
        x: 0,
        duration: 0.6,
        ease: 'power3.inOut',
      });

      // add padding to body to prevent shifting
      const scrollbarWidth = getScrollbarWidth();
      document.body.style.paddingRight = scrollbarWidth + 'px';
    },

    close(e) {
      document.body.style.paddingRight = '';
      document.body.style.height = 'auto';
      document.body.classList.remove('overflow-hidden');
      gsap.to('#mobile-menu', {
        x: '100%',
        duration: 0.3,
        ease: 'power3.inOut',
        onComplete: () => {
          menu.classList.add('hidden');
        },
      });
    },

    resize() {
      menu.style.height = window.innerHeight + 'px';
      if (window.innerWidth > 900) {
        menu.classList.add('hidden');
        document.body.classList.remove('fixed');
        document.documentElement.classList.remove('fixed');
      }
    },
  };

  function getScrollbarWidth() {
    var scrollDiv = document.createElement('div');
    scrollDiv.style.cssText =
      'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scroll;
  }
};
