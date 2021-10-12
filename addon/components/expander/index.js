import Component from '@glimmer/component';
import ExpanderContent from './content';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { waitFor } from '@ember/test-waiters';
import { waitForFrame, waitForAnimation } from '@zestia/animation-utils';

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

  get canCollapse() {
    return this.isExpanded && !this.isTransitioning;
  }

  get canExpand() {
    return !this.isExpanded && !this.isTransitioning;
  }

  @action
  handleInsertElement(api) {
    this.args.onReady?.(api);
    this._handleManualState();
  }

  @action
  handleUpdateExpanded() {
    this._handleManualState();
  }

  @action
  registerContentElement(element) {
    this.contentElement = element;
  }

  @action
  @waitFor
  async expand() {
    if (!this.canExpand) {
      return;
    }

    this.renderContent = true;
    this.isExpanded = true;
    this.args.onExpand?.();
    this._adjustToZeroHeight();
    await waitForFrame();
    this._adjustToScrollHeight();
    this.isTransitioning = true;
    await this._waitForTransition();
    this.isTransitioning = false;
    this._adjustToNoneHeight();
    this.args.onAfterExpand?.();
  }

  @action
  @waitFor
  async collapse() {
    if (!this.canCollapse) {
      return;
    }

    this.isExpanded = false;
    this.args.onCollapse?.();
    this._adjustToScrollHeight();
    await waitForFrame();
    this._adjustToZeroHeight();
    this.isTransitioning = true;
    await this._waitForTransition();
    this.isTransitioning = false;
    this._adjustToNoneHeight();
    this.renderContent = false;
    this.args.onAfterCollapse?.();
  }

  @action
  toggle() {
    if (this.renderContent) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  _handleReady(api) {
    this.args.onReady?.(api);
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
