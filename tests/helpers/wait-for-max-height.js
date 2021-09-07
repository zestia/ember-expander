import { find, waitUntil } from '@ember/test-helpers';

export default function waitForMaxHeight(selector, maxHeight) {
  return waitUntil(() => find(selector).style.maxHeight === maxHeight);
}
