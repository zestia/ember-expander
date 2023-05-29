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

  test('it render a button', async function (assert) {
    assert.expect(2);

    await render(hbs`
      <Expander as |expander|>
        <expander.Button />
      </Expander>
    `);

    assert.ok(
      find('.expander')
        .getAttribute('id')
        .match(/[\w\d]+/)
    );

    assert
      .dom('.expander__button')
      .hasAttribute('aria-controls', find('.expander').getAttribute('id'));
  });

  test('expanding', async function (assert) {
    assert.expect(12);

    await render(hbs`
      <Expander as |expander|>
        <expander.Button {{on "click" expander.expand}}>
          Expand
        </expander.Button>

        <expander.Content>
          <div class="test-internal-height"></div>
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander').hasAttribute('data-expanded', 'false');
    assert.dom('.expander').hasAttribute('data-transitioning', 'false');
    assert.dom('.expander__button').hasAttribute('aria-expanded', 'false');
    assert.dom('.expander__content').doesNotExist();

    click('.expander__button');

    await waitFor('.expander');

    assert.dom('.expander').hasAttribute('data-expanded', 'true');
    assert.dom('.expander').hasAttribute('data-transitioning', 'true');
    assert.dom('.expander__button').hasAttribute('aria-expanded', 'true');
    assert.dom('.expander__content').exists();
    assert.dom('.expander__content').hasAttribute('style', 'max-height: 10px');

    const animations = await waitForAnimation('.expander__content', {
      propertyName: 'max-height'
    });

    assert.strictEqual(animations.length, 1);

    await settled();

    assert.dom('.expander').hasAttribute('data-transitioning', 'false');
    assert.dom('.expander__content').hasAttribute('style', '');
  });

  test('collapsing', async function (assert) {
    assert.expect(12);

    await render(hbs`
      <Expander @expanded={{true}} as |expander|>
        <expander.Button {{on "click" expander.collapse}}>
          Collapse
        </expander.Button>

        <expander.Content>
          <div class="test-internal-height"></div>
        </expander.Content>
      </Expander>
    `);

    assert.dom('.expander').hasAttribute('data-expanded', 'true');
    assert.dom('.expander').hasAttribute('data-transitioning', 'false');
    assert.dom('.expander__button').hasAttribute('aria-expanded', 'true');
    assert.dom('.expander__content').exists();
    assert.dom('.expander__content').hasAttribute('style', '');

    click('.expander__button');

    await waitFor('.expander');

    assert.dom('.expander').hasAttribute('data-expanded', 'false');
    assert.dom('.expander').hasAttribute('data-transitioning', 'true');
    assert.dom('.expander__button').hasAttribute('aria-expanded', 'false');
    assert.dom('.expander__content').hasAttribute('style', 'max-height: 0px');

    const animations = await waitForAnimation('.expander__content', {
      propertyName: 'max-height'
    });

    assert.strictEqual(animations.length, 1);

    await settled();

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
        <expander.Button {{on "click" expander.toggle}}>
          Toggle
        </expander.Button>

        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    click('.expander__button');

    await waitUntil(this.midWay);
    await click('.expander__button');

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
        <expander.Button {{on "click" expander.toggle}}>
          Toggle
        </expander.Button>

        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    this.set('handleExpanded', () => assert.step('expanded'));
    this.set('handleCollapsed', () => assert.step('collapsed'));

    click('.expander__button');

    await waitUntil(this.midWay);
    await click('.expander__button');

    assert.verifySteps(['expanded']);
  });

  test('api', async function (assert) {
    assert.expect(14);

    this.handleReady = (expander) => (this.api = expander);

    await render(hbs`
      <Expander @onReady={{this.handleReady}} as |expander|>
        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    assert.strictEqual(this.api.Content, null);
    assert.strictEqual(typeof this.api.Button, 'object');
    assert.deepEqual(this.api.contentElement, null);
    assert.strictEqual(typeof this.api.toggle, 'function');
    assert.strictEqual(typeof this.api.expand, 'function');
    assert.strictEqual(typeof this.api.collapse, 'function');
    assert.false(this.api.isExpanded);
    assert.false(this.api.isTransitioning);

    assert.dom('.expander').doesNotIncludeText('Hello World');

    this.api.expand();

    await waitUntil(() => this.api.isTransitioning);
    await settled();

    assert.true(this.api.isExpanded);
    assert.false(this.api.isTransitioning);
    assert.strictEqual(typeof this.api.Content, 'object');
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
        <expander.Button {{on "click" expander.toggle}}>
          Toggle
        </expander.Button>

        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    await click('.expander__button');

    assert.verifySteps(['expanded']);

    await click('.expander__button');

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
        <expander.Button {{on "click" expander.collapse}}>
          Collapse
        </expander.Button>

        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    click('.expander__button');
    await click('.expander__button');

    assert.verifySteps(['collapsed']);
  });

  test('skipping expanding', async function (assert) {
    assert.expect(2);

    this.handleExpanded = () => assert.step('expanded');

    await render(hbs`
      <Expander @onExpanded={{this.handleExpanded}} as |expander|>
        <expander.Button {{on "click" expander.expand}}>
          Expand
        </expander.Button>

        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    click('.expander__button');
    await click('.expander__button');

    assert.verifySteps(['expanded']);
  });

  test('pre expanding', async function (assert) {
    assert.expect(2);

    this.handleExpanded = () => assert.step('expanded');

    await render(hbs`
      <Expander @expanded={{true}} @onExpanded={{this.handleExpanded}} as |expander|>
        <expander.Button {{on "click" expander.expand}}>
          Expand
        </expander.Button>

        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    const animations = await waitForAnimation('.expander__content', {
      propertyName: 'max-height',
      maybe: true
    });

    assert.deepEqual(animations, []);
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

  test('no transition', async function (assert) {
    assert.expect(1);

    await render(hbs`
      <style>
      #ember-testing .expander__content {
        transition: none
      }
      </style>

      <Expander as |expander|>
        <expander.Button {{on "click" expander.expand}}>
          Expand
        </expander.Button>

        <expander.Content>
          Hello World
        </expander.Content>
      </Expander>
    `);

    await click('.expander__button');

    assert.ok(true, 'does not hang, waiting for a transition');
  });
});
