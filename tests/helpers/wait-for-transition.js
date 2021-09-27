import { Promise } from 'rsvp';
import { find } from '@ember/test-helpers';

export default function waitForTransition(selector, propertyName) {
  const el = typeof selector === 'string' ? find(selector) : selector;

  return new Promise((resolve) => {
    function handler(event) {
      if (el === event.target && propertyName === event.propertyName) {
        el.removeEventListener('transitionend', handler);
        resolve();
      }
    }

    el.addEventListener('transitionend', handler);
  });
}
