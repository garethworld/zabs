import { gsap } from 'gsap';
window.accordion = function () {
  var openLink = null;
  var openTarget = null;
  return {
    open(e) {
      var dataTarget = e.target.getAttribute('data-target');
      var target = document.getElementById(dataTarget);
      var isOpen = e.target.getAttribute('data-open');

      var speed = 0.5;
      if (isOpen == 'false') {
        if (openTarget != null && openTarget != target) {
          closeRow(openLink, openTarget);
        }
        openRow(e.target, target);
        openTarget = target;
        openLink = e.target;
      } else {
        closeRow(e.target, target);
      }

      function openRow(link, target) {
        target.classList.remove('hidden');
        link.classList.add('text-tint3');
        gsap.set(target, { height: 'auto', opacity: 0 });
        gsap.from(target, { duration: 0.3, ease: 'sine.inOut', height: 0 });
        gsap.to(target, {
          duration: speed,
          ease: 'sine.inOut',
          opacity: 1,
          delay: 0.3,
        });
        link.setAttribute('data-open', 'true');
      }

      function closeRow(link, target) {
        link.setAttribute('data-open', 'false');
        link.classList.remove('text-tint3');
        gsap.to(target, {
          duration: speed / 2,
          ease: 'sine.inOut',
          height: 0,
        });
        gsap.to(target, {
          duration: speed / 2,
          ease: 'sine.inOut',
          opacity: 0,
          delay: 0.1,
        });
      }
    },
  };
};
