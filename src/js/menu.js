import { gsap } from 'gsap';
window.menu = function () {
  const menu = document.getElementById('mobile-menu');

  return {
    open(e) {
      menu.style.height = window.innerHeight + 'px';
      menu.classList.remove('hidden');
      document.body.classList.add('fixed');
      document.documentElement.classList.add('fixed');
      gsap.set('#mobile-menu', {
        x: '100%',
      });

      gsap.to('#mobile-menu', {
        x: 0,
        duration: 0.6,
        ease: 'power3.inOut',
      });
    },

    close(e) {
      document.body.classList.remove('fixed');
      document.documentElement.classList.remove('fixed');
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
};
