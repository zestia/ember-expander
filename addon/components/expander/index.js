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

  @action
  handleInsertElement() {
    this._handleReady(...arguments);
    this._handleManualState();
  }

  @action
  handleUpdateExpanded() {
    this._handleManualState();
  }

  @action
  expand() {
    this._expand();
  }

  @action
  expandWithTransition() {
    return this._expandWithTransition();
  }

  @action
  collapse() {
    this._collapse();
  }

  @action
  collapseWithTransition() {
    return this._collapseWithTransition();
  }

  @action
  toggle() {
    this._toggle();
  }

  @action
  toggleWithTransition(e) {
    return this._toggleWithTransition();
  }

  @action
  registerContentElement(element) {
    this.contentElement = element;
  }

  _handleReady(api) {
    this.args.onReady?.(api);
  }

  _handleManualState() {
    if (this.args.expanded === true) {
      this._expand();
    } else if (this.args.expanded === false) {
      this._collapse();
    }
  }

  _canCollapse() {
    return this.isExpanded && !this.isTransitioning;
  }

  _collapse() {
    this.isExpanded = false;
    this._afterCollapse();
  }

  _afterCollapse() {
    this.renderContent = false;
    this.args.onAfterCollapse?.();
  }

  @waitFor
  async _collapseWithTransition() {
    if (!this._canCollapse()) {
      return;
    }

    this.isExpanded = false;
    this.isTransitioning = true;

    await waitForFrame();
    this._adjustToScrollHeight();
    await waitForFrame();
    this._adjustToZeroHeight();
    await this._waitForTransition();
    this._adjustToNoneHeight();
    this._afterCollapseWithTransition();
  }

  _afterCollapseWithTransition() {
    this.renderContent = false;
    this.isTransitioning = false;
    this.args.onAfterCollapseTransition?.();
  }

  _canExpand() {
    return !this.isExpanded && !this.isTransitioning;
  }

  _expand() {
    if (!this._canExpand()) {
      return;
    }

    this.renderContent = true;
    this.isExpanded = true;
    this._afterExpand();
  }

  _afterExpand() {
    this.args.onAfterExpand?.();
  }

  @waitFor
  async _expandWithTransition() {
    this.renderContent = true;
    this.isExpanded = true;
    this.isTransitioning = true;

    await waitForFrame();
    this._adjustToZeroHeight();
    await waitForFrame();
    this._adjustToScrollHeight();
    await this._waitForTransition();
    this._adjustToNoneHeight();
    this._afterExpandWithTransition();
  }

  _afterExpandWithTransition() {
    this.isTransitioning = false;
    this.args.onAfterExpandTransition?.();
  }

  _toggle() {
    if (this.renderContent) {
      this._collapse();
    } else {
      this._expand();
    }
  }

  _toggleWithTransition() {
    if (this.renderContent) {
      return this._collapseWithTransition();
    } else {
      return this._expandWithTransition();
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
