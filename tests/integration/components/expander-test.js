import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import waitForAnimation from '../../helpers/wait-for-animation';
import waitForMaxHeight from '../../helpers/wait-for-max-height';
import hbs from 'htmlbars-inline-precompile';
import { render, find, click, settled } from '@ember/test-helpers';
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
    assert.expect(10);

    await render(hbs`
      <Expander as |expander|>
        <button type="button" {{on "click" expander.toggleWithTransition}}></button>
        <expander.Content>
          <div class="test-internal-height"></div>
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander').hasAttribute('aria-expanded', 'false');
    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').doesNotExist();

    // Expand

    click('button'); // Intentionally no await

    await waitForMaxHeight('.expander__content', '0px');

    const willExpand = waitForAnimation('.expander__content', {
      propertyName: 'max-height'
    });

    assert.dom('.expander').hasAttribute('aria-expanded', 'true');
    assert.dom('.expander').hasClass('expander--transitioning');

    await waitForMaxHeight('.expander__content', '10px');
    await waitForMaxHeight('.expander__content', '');
    await willExpand;
    await settled();

    assert.dom('.expander').doesNotHaveClass('expander--transitioning');

    // Collapse

    click('button'); // Intentionally no await

    const willCollapse = waitForAnimation('.expander__content', {
      transitionProperty: 'max-height'
    });

    await waitForMaxHeight('.expander__content', '10px');

    assert.dom('.expander').hasAttribute('aria-expanded', 'false');
    assert.dom('.expander').hasClass('expander--transitioning');

    await waitForMaxHeight('.expander__content', '0px');
    await willCollapse;
    await settled();

    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').doesNotExist();
  });

  test('expanding / collapsing (without transition)', async function (assert) {
    assert.expect(9);

    this.set('bool', false);

    await render(hbs`
      <Expander @expanded={{this.bool}} as |expander|>
        <expander.Content>
          <div class="test-internal-height"></div>
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander').hasAttribute('aria-expanded', 'false');
    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').doesNotExist();

    // Expand

    this.set('bool', true);

    assert.dom('.expander').hasAttribute('aria-expanded', 'true');
    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').exists();

    // Collapse

    this.set('bool', false);

    assert.dom('.expander').hasAttribute('aria-expanded', 'false');
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

  test('test waiter is aware of transitions', async function (assert) {
    assert.expect(4);

    this.handleExpand = () => assert.step('expanded');
    this.handleCollapse = () => assert.step('collapsed');

    await render(hbs`
      <Expander
        @onAfterExpandTransition={{this.handleExpand}}
        @onAfterCollapseTransition={{this.handleCollapse}}
        as |expander|
      >
        <button type="button" {{on "click" expander.toggleWithTransition}}></button>
        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    await click('button');

    assert.verifySteps(['expanded']);

    await click('button');

    assert.verifySteps(['collapsed']);
  });

  test('bubbling transitions', async function (assert) {
    assert.expect(1);

    await render(hbs`
      <style>
        .expander__child {
          transition: transform 100ms;
        }
        .expander__child.transition {
          transform: translateX(100px);
        }
      </style>

      <Expander as |expander|>
        <button type="button" {{on "click" expander.toggleWithTransition}}></button>
        <expander.Content>
          <div class="expander__child">
            Hello World
          </div>
        </expander.Content>
      </Expander>
    `);

    await click('button');

    find('.expander__child').classList.add('transition');

    await waitForAnimation('.expander__child', {
      transitionProperty: 'transform'
    });

    assert.ok(true, 'ignores bubbling child transitions');
  });
});
