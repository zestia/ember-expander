import Component from '@glimmer/component';
import ExpanderContent from './content';
import Modifier from 'ember-modifier';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { waitFor } from '@ember/test-waiters';
import { helper } from '@ember/component/helper';
import { next, scheduleOnce } from '@ember/runloop';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { waitForAnimation } from '@zestia/animation-utils';
const { assign } = Object;

export class LifecycleHooks extends Modifier {
  didInstall() {
    this.args.named.didInstall(this.element);
  }

  didReceiveArguments() {
    this.args.named.didReceiveArguments?.();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.args.named.willDestroy?.();
  }
}

const registerComponents = helper(function ([component], components) {
  assign(component, components);
});

class ExpanderComponent extends Component {
  ExpanderContent = ExpanderContent;
  lifecycleHooks = LifecycleHooks;
  registerComponents = registerComponents;

  @tracked maxHeight = null;
  @tracked isExpanded = false;
  @tracked isTransitioning = false;
  @tracked renderContent = false;

  get api() {
    return {
      Content: this.renderContent ? this.Content : null,
      toggle: this.toggle,
      expand: this.expand,
      collapse: this.collapse,
      isExpanded: this.isExpanded,
      isTransitioning: this.isTransitioning
    };
  }

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
  handleReceivedArguments() {
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
      this.args.onExpanded?.();
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
      this.args.onCollapsed?.();
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
}

export default ExpanderComponent;
