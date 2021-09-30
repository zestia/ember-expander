import { find } from '@ember/test-helpers';
import { waitForTransition } from '@zestia/animation-utils';

export default function (selector, propertyName) {
  const element = typeof selector === 'string' ? find(selector) : selector;

  return waitForTransition(element, propertyName);
}
