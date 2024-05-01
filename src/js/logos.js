import { gsap } from 'gsap';
import { horizontalLoop } from './horizontalLoop.js';

window.logos = function () {
  let marquee;
  return {
    init() {
      const logos = gsap.utils.toArray(this.$el.querySelectorAll('.logo'));
      let isReverse = this.$el.getAttribute('data-reverse');
      const speed = this.$el.getAttribute('data-speed');
      if (isReverse === 'true') {
        isReverse = true;
      } else {
        isReverse = false;
      }

      marquee = horizontalLoop(logos, {
        paused: false,
        draggable: false,
        speed: speed,
        repeat: -1,
        reversed: true,
      });
    },
    over() {
      marquee.pause();
    },
    out() {
      marquee.play();
    },

    resetPosition(container, width) {
      gsap.set(container, { x: -width });
    },
  };
};
