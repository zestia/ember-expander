import { Promise } from 'rsvp';
import { find, waitFor } from '@ember/test-helpers';

export default async function waitForTransition(selector, propertyName) {
  await waitFor(selector);

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
