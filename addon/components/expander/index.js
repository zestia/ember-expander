import Component from '@glimmer/component';
import ExpanderContent from './content';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { waitFor } from '@ember/test-waiters';
import { waitForFrame, waitForAnimation } from '@zestia/animation-utils';
import { next } from '@ember/runloop';
import { task } from 'ember-concurrency';

export default class ExpanderComponent extends Component {
  ExpanderContent = ExpanderContent;

  @tracked maxHeight = null;
  @tracked isExpanded = false;
  @tracked isTransitioning = false;
  @tracked renderContent = false;

  get style() {
    let style = '';

    if (this.maxHeight !== null) {
      style = `max-height: ${this.maxHeight}px`;
    }

    return htmlSafe(style);
  }

  @action
  handleInsertElement(api) {
    this.args.onReady?.(api);
    this._handleManualState();
  }

  @action
  handleUpdateExpanded() {
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
    this._adjustToZeroHeight();
    yield waitForFrame();
    this._adjustToScrollHeight();
    this.isTransitioning = true;
    yield this._waitForTransition();
    this.isTransitioning = false;
    this._adjustToNoneHeight();
  }

  @task
  @waitFor
  *_collapse() {
    this.isExpanded = false;
    this._adjustToScrollHeight();
    yield waitForFrame();
    this._adjustToZeroHeight();
    this.isTransitioning = true;
    yield this._waitForTransition();
    this.isTransitioning = false;
    this._adjustToNoneHeight();
    this.renderContent = false;
  }

  _handleManualState() {
    if (this.args.expanded === true) {
      this.expand();
    } else if (this.args.expanded === false) {
      this.collapse();
    }
  }

  _adjustToZeroHeight() {
    this.maxHeight = 0;
  }

  _adjustToNoneHeight() {
    this.maxHeight = null;
  }

  _adjustToScrollHeight() {
    this.maxHeight = this.contentElement.scrollHeight;
  }

  _waitForTransition() {
    return waitForAnimation(this.contentElement, {
      transitionProperty: 'max-height'
    });
  }
}
