import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import waitForAnimation from '../../helpers/wait-for-animation';
import hbs from 'htmlbars-inline-precompile';
import { render, click, settled, waitFor } from '@ember/test-helpers';
const { keys } = Object;

module('expander', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);

    await render(hbs`<Expander />`);

    assert.dom('.expander').exists('has an appropriate classname');
    assert.dom('.expander').hasAttribute('tabindex', '0');
  });

  test('expanding / collapsing', async function (assert) {
    assert.expect(13);

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

    click('button');

    await waitFor('.expander--transitioning');

    assert.dom('.expander__content').hasStyle({ maxHeight: '0px' });
    assert.dom('.expander').hasAttribute('aria-expanded', 'true');

    await waitForAnimation('.expander__content', {
      propertyName: 'max-height'
    });

    assert.dom('.expander__content').hasStyle({ maxHeight: '10px' });

    await settled();

    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').hasStyle({ maxHeight: 'none' });

    // Collapse

    click('button');

    await waitFor('.expander--transitioning');

    assert.dom('.expander__content').hasStyle({ maxHeight: '10px' });
    assert.dom('.expander').hasAttribute('aria-expanded', 'false');

    await waitForAnimation('.expander__content', {
      transitionProperty: 'max-height'
    });

    assert.dom('.expander__content').hasStyle({ maxHeight: '0px' });

    await settled();

    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').doesNotExist();
  });

  test('manual control', async function (assert) {
    assert.expect(2);

    await render(hbs`
      <Expander @expanded={{this.expanded}} as |expander|>
        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander').hasAttribute('aria-expanded', 'false');

    this.set('expanded', true);

    await settled();

    assert.dom('.expander').hasAttribute('aria-expanded', 'true');
  });

  test('api', async function (assert) {
    assert.expect(3);

    let api;

    this.handleReady = (expander) => (api = expander);

    await render(hbs`
      <Expander @onReady={{this.handleReady}} as |expander|>
        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

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

    assert.dom('.expander').doesNotIncludeText('Hello World');

    await api.expand();

    assert.dom('.expander').hasText('Hello World');

    // assert.true(api.isExpanded, 'api is up to date');
  });

  test('after transition actions', async function (assert) {
    assert.expect(4);

    this.handleExpanded = () => assert.step('expanded');
    this.handleCollapsed = () => assert.step('collapsed');

    await render(hbs`
      <Expander
        @onExpanded={{this.handleExpanded}}
        @onCollapsed={{this.handleCollapsed}}
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
