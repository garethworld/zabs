import gsap from 'gsap';

window.accordion = function () {
  const accordionSpeed = 0.3;
  return {
    toggle() {
      const content =
        this.$el.parentElement.querySelector('.accordion-content');
      const status = this.$el.querySelector('.status');
      let isOpen = this.$el.getAttribute('data-open');

      if (isOpen === 'false') {
        gsap.to(content, {
          height: 'auto',
          duration: accordionSpeed,
          ease: 'power3.inOut',
        });
        this.$el.setAttribute('data-open', 'true');
        status.innerHTML = '-';
        this.$el.classList.add('text-tint3');
        this.$el.classList.remove('text-tint1');
      } else {
        gsap.to(content, {
          height: 0,
          duration: accordionSpeed,
          ease: 'power3.inOut',
        });
        this.$el.setAttribute('data-open', 'false');
        status.innerHTML = '+';
        this.$el.classList.add('text-tint1');
        this.$el.classList.remove('text-tint3');
      }
    },
  };
};
