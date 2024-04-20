import Highway from '@dogstudio/highway';
import { gsap } from 'gsap';

class Fade extends Highway.Transition {
  in({ from, to, done }) {
    window.scrollTo(0, 0);
    document.body.classList.remove('fixed');
    document.documentElement.classList.remove('fixed');
    from.remove();

    gsap.fromTo(
      '.content',
      { opacity: 0 },
      {
        opacity: 1,
        delay: 0.3,
        duration: 0.4,
        ease: 'sine.inOut',
        onComplete: function () {
          done();
        },
      },
    );
  }

  out({ from, done }) {
    gsap.fromTo(
      '.content',
      { opacity: 1 },
      {
        opacity: 0,
        ease: 'sine.inOut',
        duration: 0.1,
        onComplete: function () {
          done();
        },
      },
    );
  }
}

export default Fade;
