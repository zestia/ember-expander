import Component from '@glimmer/component';
import ExpanderContent from './content';
import ExpanderButton from './button';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { waitFor } from '@ember/test-waiters';
import { next, scheduleOnce } from '@ember/runloop';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { guidFor } from '@ember/object/internals';
import { waitForAnimation } from '@zestia/animation-utils';
const { assign } = Object;

class ExpanderComponent extends Component {
  @tracked isExpanded = !!this.args.expanded;
  @tracked isTransitioning = false;
  @tracked maxHeight = null;
  @tracked renderContent = !!this.args.expanded;

  Button;
  Content;
  contentElement = null;
  ExpanderButton = ExpanderButton;
  ExpanderContent = ExpanderContent;
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

  @action
  handleInsertElement() {
    this.args.onReady?.(this.api);
  }

  @action
  handleUpdatedArguments() {
    next(() => this._handleManualState());
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
    } catch {}
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
    } catch {}
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

  _handleManualState() {
    if (this.args.expanded === true) {
      this.expand();
    } else if (this.args.expanded === false) {
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
      transitionProperty: 'max-height'
    });
  }

  api = new Proxy(this, {
    get(target, key) {
      if (
        ![
          'Button',
          'Content',
          'contentElement',
          'toggle',
          'expand',
          'collapse',
          'isExpanded',
          'isTransitioning'
        ].includes(key) ||
        (key === 'Content' && !target.renderContent)
      ) {
        return;
      }

      return target[key];
    },

    set() {}
  });
}

export default ExpanderComponent;
