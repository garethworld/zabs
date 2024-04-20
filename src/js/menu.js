import { gsap } from 'gsap';
window.menu = function () {
  var menu = document.getElementById('mob-menu');
  var logo = document.getElementById('logo-svg');
  var close = document.getElementById('close-menu');
  return {
    openMenu(e) {
      menu.style.height = window.innerHeight + 'px';
      menu.classList.remove('hidden');
      document.body.classList.add('fixed');
      document.documentElement.classList.add('fixed');
      close.classList.remove('hidden');
      logo.classList.add('fill-tint1');

      gsap.set('#mob-menu li', { opacity: 0 });

      var menuAnim = gsap.timeline({ delay: 0.5 });

      menuAnim.to('#mob-menu li', {
        opacity: 1,
        duration: 0,
        stagger: 0.2,
      });
    },

    closeMenu(e) {
      document.body.classList.remove('fixed');
      document.documentElement.classList.remove('fixed');
      menu.classList.add('hidden');
      logo.classList.remove('fill-tint1');
      close.classList.add('hidden');
    },

    resize() {
      menu.style.height = window.innerHeight + 'px';
    },
  };
};
