import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  settled,
  render,
  find,
  click,
  waitUntil,
  waitFor
} from '@ember/test-helpers';
import { Promise } from 'rsvp';
import hbs from 'htmlbars-inline-precompile';

module('expander', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(1);

    await render(hbs`<Expander />`);

    assert.dom('.expander').exists('has an appropriate classname');
  });

  test('expanding / collapsing (with transition)', async function(assert) {
    assert.expect(4);

    await render(hbs`
      <Expander as |expander|>
        <button {{on "click" expander.toggleWithTransition}}></button>
        <expander.Content>
          <div class="test-internal-height"></div>
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander__content').doesNotExist();
    assert.dom('.expander').hasAttribute('aria-expanded', 'false');
    assert.dom('.expander').doesNotHaveClass('expander--expanded');
    assert.dom('.expander').doesNotHaveClass('expander--transitioning');

    click('button'); // Intentionally no await

    await waitUntil(() =>
      find('.expander__content').style.maxHeight.match(/0px|10px/)
    );
    await waitUntil(() =>
      find('.expander').hasAttribute('aria-expanded', 'true')
    );
    await waitUntil(() =>
      find('.expander').classList.contains('expander--expanded')
    );
    await waitUntil(() =>
      find('.expander').classList.contains('expander--transitioning')
    );
    await waitUntil(
      () => find('.expander__content').style.maxHeight === '10px'
    );
    await waitForTransition('.expander__content');
    await waitUntil(() => find('.expander__content').style.maxHeight === '');
    await waitUntil(
      () => !find('.expander').classList.contains('expander--transitioning')
    );

    click('button'); // Intentionally no await

    await waitUntil(
      () => find('.expander__content').style.maxHeight === '10px'
    );
    await waitUntil(
      () => !find('.expander').classList.contains('expander--expanded')
    );
    await waitUntil(() =>
      find('.expander').classList.contains('expander--transitioning')
    );
    await waitUntil(() => find('.expander__content').style.maxHeight === '0px');
    await waitForTransition('.expander__content');
    await waitUntil(() => !find('.expander__content'));
    await waitUntil(
      () => !find('.expander').classList.contains('expander--transitioning')
    );
  });

  test('expanding / collapsing (without transition)', async function(assert) {
    assert.expect(11);

    this.set('bool', false);

    await render(hbs`
      <Expander @expanded={{this.bool}} as |expander|>
        <expander.Content>
          <div class="test-internal-height"></div>
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander__content').doesNotExist();
    assert.dom('.expander').hasAttribute('aria-expanded', 'false');
    assert.dom('.expander').doesNotHaveClass('expander--expanded');
    assert.dom('.expander').doesNotHaveClass('expander--transitioning');

    this.set('bool', true);

    assert.dom('.expander__content').exists();
    assert.dom('.expander').hasAttribute('aria-expanded', 'true');
    assert.dom('.expander').hasClass('expander--expanded');
    assert.dom('.expander').doesNotHaveClass('expander--transitioning');

    this.set('bool', false);

    assert.dom('.expander').doesNotHaveClass('expander--expanded');
    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').doesNotExist();
  });

  test('yielded state', async function(assert) {
    assert.expect(2);

    await render(hbs`
      <Expander as |expander|>
        Expanded: {{expander.isExpanded}}
        <button {{on "click" expander.expandWithTransition}}></button>
        <expander.Content>
          <div class="test-internal-height"></div>
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander').hasText('Expanded: false');

    await click('button');
    await waitForTransition('.expander__content');
    await settled();

    assert.dom('.expander').hasText('Expanded: true');
  });

  test('after expand transition', async function(assert) {
    assert.expect(2);

    let args;

    this.set('afterExpandTransition', (..._args) => {
      args = _args;
    });

    await render(hbs`
      <Expander @onAfterExpandTransition={{this.afterExpandTransition}} as |expander|>
        <button {{on "click" expander.expandWithTransition}}></button>
        <expander.Content>
          <div class="test-internal-height"></div>
        </expander.Content>
      </Expander>
    `);

    click('button');

    assert.strictEqual(args, undefined);

    await waitFor('.expander__content');

    await waitForTransition('.expander__content');

    await settled();

    assert.deepEqual(
      args[0],
      find('.expander__content'),
      'after the expand transition, the expander content element is sent as an argument'
    );
  });
});

function waitForTransition(selector, property) {
  return new Promise(resolve => {
    find(selector).addEventListener('transitionend', resolve, { once: true });
  });
}
