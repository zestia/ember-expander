/* eslint-disable ember/no-runloop */

import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { hash } from '@ember/helper';
import { htmlSafe } from '@ember/template';
import { next, scheduleOnce } from '@ember/runloop';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { waitFor } from '@ember/test-waiters';
import { waitForAnimation } from '@zestia/animation-utils';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import ExpanderButton from '@zestia/ember-expander/components/expander/button';
import ExpanderContent from '@zestia/ember-expander/components/expander/content';
const { assign } = Object;

export default class ExpanderComponent extends Component {
  @tracked isExpanded = !!this.args.expanded;
  @tracked isTransitioning = false;
  @tracked maxHeight = null;
  @tracked renderContent = !!this.args.expanded;

  Button;
  Content;
  contentElement = null;
  didSetUp;
  id = guidFor(this);

  registerComponents = (components) => {
    assign(this, components);
  };

  get style() {
    let style = '';

    if (this.maxHeight !== null) {
      style = `max-height: ${this.maxHeight}px`;
    }

    return htmlSafe(style);
  }

  lifecycle = modifier((element, [expanded]) => {
    if (!this.didSetUp) {
      this.handleInsertElement();
      this.didSetUp = true;
    }

    this.handleUpdatedArguments({ expanded });
  });

  @action
  handleInsertElement() {
    this.args.onReady?.(this.api);
  }

  @action
  handleUpdatedArguments({ expanded }) {
    next(() => this._handleManualState(expanded));
  }

  @action
  registerContentElement(element) {
    this.contentElement = element;
  }

  @action
  async expand() {
    if (this.isExpanded) {
      return;
    }

    if (this.isTransitioning) {
      this.collapseTask.cancel();
    }

    this.expandTask = this._expand.perform();

    try {
      await this.expandTask;
      this.args.onExpanded?.(this.api);
    } catch {
      // squelch
    }
  }

  @action
  async collapse() {
    if (!this.isExpanded) {
      return;
    }

    if (this.isTransitioning) {
      this.expandTask.cancel();
    }

    this.collapseTask = this._collapse.perform();

    try {
      await this.collapseTask;
      this.args.onCollapsed?.(this.api);
    } catch {
      // squelch
    }
  }

  @action
  toggle() {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  @task
  @waitFor
  *_expand() {
    this.renderContent = true;
    this.isExpanded = true;
    this.maxHeight = 0;
    yield this._waitForRender();
    this.maxHeight = this.contentElement.scrollHeight;
    this.isTransitioning = true;
    yield this._waitForTransition();
    this.isTransitioning = false;
    this.maxHeight = null;
  }

  @task
  @waitFor
  *_collapse() {
    this.isExpanded = false;
    this.maxHeight = this.contentElement.scrollHeight;
    yield this._waitForRender();
    this.contentElement.getBoundingClientRect();
    this.maxHeight = 0;
    this.isTransitioning = true;
    yield this._waitForTransition();
    this.isTransitioning = false;
    this.renderContent = false;
    this.maxHeight = null;
  }

  _handleManualState(bool) {
    if (bool === true) {
      this.expand();
    } else if (bool === false) {
      this.collapse();
    }
  }

  _waitForRender() {
    return new Promise((resolve) => {
      scheduleOnce('afterRender', resolve);
    });
  }

  _waitForTransition() {
    return waitForAnimation(this.contentElement, {
      transitionProperty: 'max-height',
      maybe: true
    });
  }

  get _api() {
    return {
      Button: this.Button,
      Content: this.renderContent ? this.Content : null,
      contentElement: this.contentElement,
      toggle: this.toggle,
      expand: this.expand,
      collapse: this.collapse,
      isExpanded: this.isExpanded,
      isTransitioning: this.isTransitioning
    };
  }

  api = new Proxy(this, {
    get(target, key) {
      return target._api[key];
    },
    set() {}
  });

  <template>
    {{! template-lint-disable no-unsupported-role-attributes }}
    {{this.registerComponents
      (hash
        Button=(component
          ExpanderButton aria-controls=this.id aria-expanded=this.isExpanded
        )
        Content=(component
          ExpanderContent onInsert=this.registerContentElement style=this.style
        )
      )
    }}
    <div
      id={{this.id}}
      class="expander"
      data-transitioning="{{this.isTransitioning}}"
      data-expanded="{{this.isExpanded}}"
      role="region"
      ...attributes
      {{this.lifecycle @expanded}}
    >
      {{yield this.api}}
    </div>
  </template>
}
