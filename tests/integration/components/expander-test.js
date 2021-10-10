import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import waitForAnimation from '../../helpers/wait-for-animation';
import waitForMaxHeight from '../../helpers/wait-for-max-height';
import hbs from 'htmlbars-inline-precompile';
import { render, click, settled } from '@ember/test-helpers';
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
        'expand',
        'collapse',
        'isExpanded',
        'isTransitioning'
      ],
      'exposes the api when ready'
    );
  });

  test('expanding / collapsing', async function (assert) {
    assert.expect(10);

    await render(hbs`
      <Expander as |expander|>
        <button type="button" {{on "click" expander.toggle}}></button>
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

    await waitForMaxHeight('.expander__content', '10px');

    const willCollapse = waitForAnimation('.expander__content', {
      transitionProperty: 'max-height'
    });

    assert.dom('.expander').hasAttribute('aria-expanded', 'false');
    assert.dom('.expander').hasClass('expander--transitioning');

    await waitForMaxHeight('.expander__content', '0px');
    await willCollapse;

    await settled();

    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').doesNotExist();
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

    await api.expand();

    assert.dom('.expander').hasText('Hello World');
  });

  test('after transition actions', async function (assert) {
    assert.expect(4);

    this.handleExpand = () => assert.step('expanded');
    this.handleCollapse = () => assert.step('collapsed');

    await render(hbs`
      <Expander
        @onAfterExpand={{this.handleExpand}}
        @onAfterCollapse={{this.handleCollapse}}
        as |expander|
      >
        <button type="button" {{on "click" expander.toggle}}></button>
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
});
