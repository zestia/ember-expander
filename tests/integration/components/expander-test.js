import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import waitForAnimation from '../../helpers/wait-for-animation';
import hbs from 'htmlbars-inline-precompile';
import {
  render,
  click,
  settled,
  waitFor,
  waitUntil,
  find
} from '@ember/test-helpers';
const { keys } = Object;

module('expander', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.midWay = () => {
      const element = find('.expander__content');

      if (!element) {
        return;
      }

      const height = parseInt(getComputedStyle(element).height, 10);

      return height > 0 && height < 10;
    };
  });

  test('it renders', async function (assert) {
    assert.expect(2);

    await render(hbs`<Expander />`);

    assert.dom('.expander').exists('has an appropriate classname');
    assert.dom('.expander').hasAttribute('tabindex', '0');
  });

  test('expanding', async function (assert) {
    assert.expect(9);

    await render(hbs`
      <Expander as |expander|>
        <button type="button" {{on "click" expander.expand}}></button>
        <expander.Content>
          <div class="test-internal-height"></div>
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander').hasAttribute('aria-expanded', 'false');
    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').doesNotExist();

    click('button');

    await waitFor('.expander');

    assert.dom('.expander').hasAttribute('aria-expanded', 'true');
    assert.dom('.expander').hasClass('expander--transitioning');
    assert.dom('.expander__content').exists();
    assert.dom('.expander__content').hasAttribute('style', 'max-height: 10px');

    await waitForAnimation('.expander__content', {
      propertyName: 'max-height'
    });

    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').hasAttribute('style', '');
  });

  test('collapsing', async function (assert) {
    assert.expect(9);

    await render(hbs`
      <Expander @expanded={{true}} as |expander|>
        <button type="button" {{on "click" expander.collapse}}></button>
        <expander.Content>
          <div class="test-internal-height"></div>
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander').hasAttribute('aria-expanded', 'true');
    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').exists();
    assert.dom('.expander__content').hasAttribute('style', '');

    click('button');

    await waitFor('.expander');

    assert.dom('.expander').hasAttribute('aria-expanded', 'false');
    assert.dom('.expander').hasClass('expander--transitioning');
    assert.dom('.expander__content').hasAttribute('style', 'max-height: 0px');

    await waitForAnimation('.expander__content', {
      propertyName: 'max-height'
    });

    assert.dom('.expander').doesNotHaveClass('expander--transitioning');
    assert.dom('.expander__content').doesNotExist();
  });

  test('collapsing mid expand', async function (assert) {
    assert.expect(2);

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

    click('button');

    await waitUntil(this.midWay);
    await click('button');

    assert.verifySteps(['collapsed']);
  });

  test('expanding mid collapse', async function (assert) {
    assert.expect(2);

    await render(hbs`
      <Expander
        @expanded={{true}}
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

    this.set('handleExpanded', () => assert.step('expanded'));
    this.set('handleCollapsed', () => assert.step('collapsed'));

    click('button');

    await waitUntil(this.midWay);
    await click('button');

    assert.verifySteps(['expanded']);
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

    api.expand();

    await settled();

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

  test('skipping collapsing', async function (assert) {
    assert.expect(2);

    this.handleCollapsed = () => assert.step('collapsed');

    await render(hbs`
      <Expander
        @expanded={{true}}
        @onCollapsed={{this.handleCollapsed}}
        as |expander|
      >
        <button type="button" {{on "click" expander.collapse}}></button>
        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    click('button');
    await click('button');

    assert.verifySteps(['collapsed']);
  });

  test('skipping expanding', async function (assert) {
    assert.expect(2);

    this.handleExpanded = () => assert.step('expanded');

    await render(hbs`
      <Expander @onExpanded={{this.handleExpanded}} as |expander|>
        <button type="button" {{on "click" expander.expand}}></button>
        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    click('button');
    await click('button');

    assert.verifySteps(['expanded']);
  });
});
