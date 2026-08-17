import { inView } from 'motion';
import { animate } from 'motion/mini';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

if (!reducedMotion && targets.length > 0) {
  document.documentElement.dataset.motion = 'ready';

  requestAnimationFrame(() => {
    inView(
      targets,
      (element) => {
        const target = element as HTMLElement;
        const delay = Number.parseFloat(target.dataset.revealDelay ?? '0');

        animate(
          target,
          {
            opacity: [0, 1],
            transform: ['translate3d(0, 1.6rem, 0) scale(0.985)', 'translate3d(0, 0, 0) scale(1)'],
          },
          {
            duration: 0.62,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        );
      },
      { amount: 0.16, margin: '0px 0px -10% 0px' },
    );
  });
}
