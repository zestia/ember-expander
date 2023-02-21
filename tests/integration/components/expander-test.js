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
const { keys, isSealed } = Object;

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
    assert.expect(3);

    await render(hbs`<Expander />`);

    assert.dom('.expander').exists('has an appropriate classname');
    assert.dom('.expander').doesNotHaveAttribute('tabindex');
    assert.dom('.expander').hasAttribute('role', 'region');
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

    assert.dom('.expander').hasAttribute('data-expanded', 'false');
    assert.dom('.expander').hasAttribute('data-transitioning', 'false');
    assert.dom('.expander__content').doesNotExist();

    click('button');

    await waitFor('.expander');

    assert.dom('.expander').hasAttribute('data-expanded', 'true');
    assert.dom('.expander').hasAttribute('data-transitioning', 'true');
    assert.dom('.expander__content').exists();
    assert.dom('.expander__content').hasAttribute('style', 'max-height: 10px');

    await waitForAnimation('.expander__content', {
      propertyName: 'max-height'
    });

    assert.dom('.expander').hasAttribute('data-transitioning', 'false');
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

    assert.dom('.expander').hasAttribute('data-expanded', 'true');
    assert.dom('.expander').hasAttribute('data-transitioning', 'false');
    assert.dom('.expander__content').exists();
    assert.dom('.expander__content').hasAttribute('style', '');

    click('button');

    await waitFor('.expander');

    assert.dom('.expander').hasAttribute('data-expanded', 'false');
    assert.dom('.expander').hasAttribute('data-transitioning', 'true');
    assert.dom('.expander__content').hasAttribute('style', 'max-height: 0px');

    await waitForAnimation('.expander__content', {
      propertyName: 'max-height'
    });

    assert.dom('.expander').hasAttribute('data-transitioning', 'false');
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

  test('api', async function (assert) {
    assert.expect(9);

    this.handleReady = (expander) => (this.api = expander);

    await render(hbs`
      <Expander @onReady={{this.handleReady}} as |expander|>
        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    assert.deepEqual(
      keys(this.api),
      [
        'Content',
        'contentElement',
        'toggle',
        'expand',
        'collapse',
        'isExpanded',
        'isTransitioning'
      ],
      'exposes the api when ready'
    );

    assert.true(isSealed(this.api));
    assert.false(this.api.isExpanded);
    assert.strictEqual(this.api.contentElement, undefined);
    assert.dom('.expander').doesNotIncludeText('Hello World');

    this.api.expand();

    await settled();

    assert.true(this.api.isExpanded);
    assert.false(this.api.isTransitioning);
    assert.deepEqual(this.api.contentElement, find('.expander__content'));
    assert.dom('.expander').hasText('Hello World');
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

  test('pre expanding', async function (assert) {
    assert.expect(2);

    this.handleExpanded = () => assert.step('expanded');

    await render(hbs`
      <Expander @expanded={{true}} @onExpanded={{this.handleExpanded}} as |expander|>
        <button type="button" {{on "click" expander.expand}}></button>
        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    assert.rejects(
      waitForAnimation('.expander__content', {
        propertyName: 'max-height',
        maybe: true
      })
    );

    assert.verifySteps([]);
  });

  test('manual control', async function (assert) {
    assert.expect(6);

    this.handleExpanded = () => assert.step('expanded');
    this.handleCollapsed = () => assert.step('collapsed');

    await render(hbs`
      <Expander
        @expanded={{this.expanded}}
        @onExpanded={{this.handleExpanded}}
        @onCollapsed={{this.handleCollapsed}}
        as |expander|
      >
        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander').hasAttribute('data-expanded', 'false');

    this.set('expanded', true);

    await settled();

    assert.dom('.expander').hasAttribute('data-expanded', 'true');

    assert.verifySteps(['expanded']);

    this.set('expanded', false);

    await settled();

    assert.verifySteps(['collapsed']);
  });
});
