import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import waitForTransition from '../../helpers/wait-for-transition';
import hbs from 'htmlbars-inline-precompile';
import { render, find, click, waitUntil } from '@ember/test-helpers';
const { keys } = Object;

module('expander', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(1);

    await render(hbs`<Expander />`);

    assert.dom('.expander').exists('has an appropriate classname');
  });

  test('ready action', async function (assert) {
    assert.expect(1);

    let api;

    this.handleReady = (expander) => (api = expander);

    await render(hbs`<Expander @onReady={{this.handleReady}} />`);

    assert.deepEqual(
      keys(api),
      [
        'Content',
        'toggle',
        'toggleWithTransition',
        'expand',
        'expandWithTransition',
        'collapse',
        'collapseWithTransition',
        'isExpanded',
        'isTransitioning'
      ],
      'exposes the api when ready'
    );
  });

  test('expanding / collapsing (with transition)', async function (assert) {
    assert.expect(7);

    await render(hbs`
      <Expander as |expander|>
        <button type="button" {{on "click" expander.toggleWithTransition}}></button>
        <expander.Content>
          <div class="test-internal-height"></div>
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander').hasAttribute('aria-expanded', 'false');
    assert.dom('.expander').doesNotHaveClass('expander--expanded');
    assert.dom('.expander').hasClass('expander--collapsed');
    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').doesNotExist();

    click('button'); // Intentionally no await

    // Can't seem test this, due to Ember optimising initial render

    // await waitUntil(() =>
    //   find('.expander__content').style.maxHeight === '0px'
    // );

    await waitUntil(() =>
      find('.expander').hasAttribute('aria-expanded', 'true')
    );

    await waitUntil(() =>
      find('.expander').classList.contains('expander--expanded')
    );

    assert.dom('.expander').doesNotHaveClass('expander-collapsed');

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

    assert.dom('.expander').hasClass('expander--collapsed');

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

  test('expanding / collapsing (without transition)', async function (assert) {
    assert.expect(14);

    this.set('bool', false);

    await render(hbs`
      <Expander @expanded={{this.bool}} as |expander|>
        <expander.Content>
          <div class="test-internal-height"></div>
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander').hasAttribute('aria-expanded', 'false');
    assert.dom('.expander').doesNotHaveClass('expander--expanded');
    assert.dom('.expander').hasClass('expander--collapsed');
    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').doesNotExist();

    this.set('bool', true);

    assert.dom('.expander').hasAttribute('aria-expanded', 'true');
    assert.dom('.expander').hasClass('expander--expanded');
    assert.dom('.expander').doesNotHaveClass('expander--collapsed');
    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').exists();

    this.set('bool', false);

    assert.dom('.expander').doesNotHaveClass('expander--expanded');
    assert.dom('.expander').hasClass('expander--collapsed');
    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').doesNotExist();
  });

  test('yielded state', async function (assert) {
    assert.expect(2);

    await render(hbs`
      <Expander as |expander|>
        Expanded: {{expander.isExpanded}}
        <button type="button" {{on "click" expander.expandWithTransition}}></button>
        <expander.Content>
          <div class="test-internal-height"></div>
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander').hasText('Expanded: false');

    await click('button');

    assert.dom('.expander').hasText('Expanded: true');
  });

  test('api promises', async function (assert) {
    assert.expect(2);

    let api;

    this.handleReady = (expander) => (api = expander);

    await render(hbs`
      <Expander @onReady={{this.handleReady}} as |expander|>
        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander').doesNotIncludeText('Hello World');

    await api.expandWithTransition();

    assert.dom('.expander').hasText('Hello World');
  });
});
