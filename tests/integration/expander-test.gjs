/* eslint-disable ember/template-no-let-reference */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import waitForAnimation from '../helpers/wait-for-animation';
import {
  render,
  click,
  settled,
  waitFor,
  waitUntil,
  find
} from '@ember/test-helpers';
import Expander from '@zestia/ember-expander/components/expander';
import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';
import '../../demo/styles/app.css';

module('expander', function (hooks) {
  setupRenderingTest(hooks);

  let state;

  const midWay = () => {
    const element = find('.expander__content');

    if (!element) {
      return;
    }

    const height = parseInt(getComputedStyle(element).height, 10);

    return height > 0 && height < 10;
  };

  hooks.beforeEach(function () {
    state = new (class {
      @tracked expanded;
    })();
  });

  test('it renders', async function (assert) {
    assert.expect(3);

    await render(<template><Expander /></template>);

    assert.dom('.expander').exists('has an appropriate classname');
    assert.dom('.expander').doesNotHaveAttribute('tabindex');
    assert.dom('.expander').hasAttribute('role', 'region');
  });

  test('it render a button', async function (assert) {
    assert.expect(2);

    await render(
      <template>
        <Expander as |expander|>
          <expander.Button />
        </Expander>
      </template>
    );

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

    await render(
      <template>
        <Expander as |expander|>
          <expander.Button {{on "click" expander.expand}}>
            Expand
          </expander.Button>

          <expander.Content>
            <div class="test-internal-height"></div>
          </expander.Content>
        </Expander>
      </template>
    );

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
      transitionProperty: 'max-height'
    });

    assert.strictEqual(animations.length, 1);

    await settled();

    assert.dom('.expander').hasAttribute('data-transitioning', 'false');
    assert.dom('.expander__content').hasAttribute('style', '');
  });

  test('collapsing', async function (assert) {
    assert.expect(12);

    await render(
      <template>
        <Expander @expanded={{true}} as |expander|>
          <expander.Button {{on "click" expander.collapse}}>
            Collapse
          </expander.Button>

          <expander.Content>
            <div class="test-internal-height"></div>
          </expander.Content>
        </Expander>
      </template>
    );

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
      transitionProperty: 'max-height'
    });

    assert.strictEqual(animations.length, 1);

    await settled();

    assert.dom('.expander').hasAttribute('data-transitioning', 'false');
    assert.dom('.expander__content').doesNotExist();
  });

  test('collapsing mid expand', async function (assert) {
    assert.expect(2);

    const handleExpanded = () => assert.step('expanded');
    const handleCollapsed = () => assert.step('collapsed');

    await render(
      <template>
        <Expander
          @onExpanded={{handleExpanded}}
          @onCollapsed={{handleCollapsed}}
          as |expander|
        >
          <expander.Button {{on "click" expander.toggle}}>
            Toggle
          </expander.Button>

          <expander.Content>
            Hello World
          </expander.Content>
        </Expander>
      </template>
    );

    click('.expander__button');

    await waitUntil(midWay);
    await click('.expander__button');

    assert.verifySteps(['collapsed']);
  });

  test('expanding mid collapse', async function (assert) {
    assert.expect(2);

    const handleExpanded = () => assert.step('expanded');
    const handleCollapsed = () => assert.step('collapsed');

    await render(
      <template>
        <Expander
          @expanded={{true}}
          @onExpanded={{handleExpanded}}
          @onCollapsed={{handleCollapsed}}
          as |expander|
        >
          <expander.Button {{on "click" expander.toggle}}>
            Toggle
          </expander.Button>

          <expander.Content>
            Hello World
          </expander.Content>
        </Expander>
      </template>
    );

    click('.expander__button');

    await waitUntil(midWay);
    await click('.expander__button');

    assert.verifySteps(['expanded']);
  });

  test('api', async function (assert) {
    assert.expect(14);

    let api;

    const handleReady = (expander) => (api = expander);

    await render(
      <template>
        <Expander @onReady={{handleReady}} as |expander|>
          <expander.Content>
            Hello World
          </expander.Content>
        </Expander>
      </template>
    );

    assert.strictEqual(api.Content, null);
    assert.strictEqual(typeof api.Button, 'object');
    assert.deepEqual(api.contentElement, null);
    assert.strictEqual(typeof api.toggle, 'function');
    assert.strictEqual(typeof api.expand, 'function');
    assert.strictEqual(typeof api.collapse, 'function');
    assert.false(api.isExpanded);
    assert.false(api.isTransitioning);

    assert.dom('.expander').doesNotIncludeText('Hello World');

    api.expand();

    await waitUntil(() => api.isTransitioning);
    await settled();

    assert.true(api.isExpanded);
    assert.false(api.isTransitioning);
    assert.strictEqual(typeof api.Content, 'object');
    assert.deepEqual(api.contentElement, find('.expander__content'));
    assert.dom('.expander').hasText('Hello World');
  });

  test('after transition actions', async function (assert) {
    assert.expect(4);

    const handleExpanded = () => assert.step('expanded');
    const handleCollapsed = () => assert.step('collapsed');

    await render(
      <template>
        <Expander
          @onExpanded={{handleExpanded}}
          @onCollapsed={{handleCollapsed}}
          as |expander|
        >
          <expander.Button {{on "click" expander.toggle}}>
            Toggle
          </expander.Button>

          <expander.Content>
            Hello World
          </expander.Content>
        </Expander>
      </template>
    );

    await click('.expander__button');

    assert.verifySteps(['expanded']);

    await click('.expander__button');

    assert.verifySteps(['collapsed']);
  });

  test('skipping collapsing', async function (assert) {
    assert.expect(2);

    const handleCollapsed = () => assert.step('collapsed');

    await render(
      <template>
        <Expander
          @expanded={{true}}
          @onCollapsed={{handleCollapsed}}
          as |expander|
        >
          <expander.Button {{on "click" expander.collapse}}>
            Collapse
          </expander.Button>

          <expander.Content>
            Hello World
          </expander.Content>
        </Expander>
      </template>
    );

    click('.expander__button');
    await click('.expander__button');

    assert.verifySteps(['collapsed']);
  });

  test('skipping expanding', async function (assert) {
    assert.expect(2);

    const handleExpanded = () => assert.step('expanded');

    await render(
      <template>
        <Expander @onExpanded={{handleExpanded}} as |expander|>
          <expander.Button {{on "click" expander.expand}}>
            Expand
          </expander.Button>

          <expander.Content>
            Hello World
          </expander.Content>
        </Expander>
      </template>
    );

    click('.expander__button');
    await click('.expander__button');

    assert.verifySteps(['expanded']);
  });

  test('pre expanding', async function (assert) {
    assert.expect(2);

    const handleExpanded = () => assert.step('expanded');

    await render(
      <template>
        <Expander
          @expanded={{true}}
          @onExpanded={{handleExpanded}}
          as |expander|
        >
          <expander.Button {{on "click" expander.expand}}>
            Expand
          </expander.Button>

          <expander.Content>
            Hello World
          </expander.Content>
        </Expander>
      </template>
    );

    const animations = await waitForAnimation('.expander__content', {
      transitionProperty: 'max-height',
      maybe: true
    });

    assert.deepEqual(animations, []);
    assert.verifySteps([]);
  });

  test('manual control', async function (assert) {
    assert.expect(6);

    const handleExpanded = () => assert.step('expanded');
    const handleCollapsed = () => assert.step('collapsed');

    await render(
      <template>
        <Expander
          @expanded={{state.expanded}}
          @onExpanded={{handleExpanded}}
          @onCollapsed={{handleCollapsed}}
          as |expander|
        >
          <expander.Content>
            Hello World
          </expander.Content>
        </Expander>
      </template>
    );

    assert.dom('.expander').hasAttribute('data-expanded', 'false');

    state.expanded = true;

    await settled();

    assert.dom('.expander').hasAttribute('data-expanded', 'true');

    assert.verifySteps(['expanded']);

    state.expanded = false;

    await settled();

    assert.verifySteps(['collapsed']);
  });

  test('no transition', async function (assert) {
    assert.expect(1);

    await render(
      <template>
        {{! template-lint-disable no-forbidden-elements }}
        <style>
          #ember-testing .expander__content {
            transition: none;
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
      </template>
    );

    await click('.expander__button');

    assert.ok(true, 'does not hang, waiting for a transition');
  });
});
