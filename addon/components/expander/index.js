import Component from '@glimmer/component';
import ExpanderContent from './content';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { Promise, defer } from 'rsvp';
import { waitForPromise } from '@ember/test-waiters';
const { requestAnimationFrame } = window;

export default class ExpanderComponent extends Component {
  ExpanderContent = ExpanderContent;

  transition = null;

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
  handleTransitionEnd(event) {
    if (
      this.transition &&
      event.target === this.contentElement &&
      event.propertyName === 'max-height'
    ) {
      this.transition.resolve();
      this.transition = null;
    }
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

  _collapse() {
    this.isExpanded = false;
    this._afterCollapse();
  }

  _afterCollapse() {
    this.renderContent = false;
    this.args.onAfterCollapse?.();
  }

  _collapseWithTransition() {
    this.isExpanded = false;
    this.isTransitioning = true;

    return waitForPromise(
      this._waitForFrame()
        .then(() => this._adjustToScrollHeight())
        .then(() => this._waitForFrame())
        .then(() => this._adjustToZeroHeight())
        .then(() => this._waitForTransition())
        .then(() => this._adjustToNoneHeight())
        .then(() => this._afterCollapseWithTransition()),
      '@zestia/ember-expander:collapse'
    );
  }

  _afterCollapseWithTransition() {
    this.renderContent = false;
    this.isTransitioning = false;
    this.args.onAfterCollapseTransition?.();
  }

  _expand() {
    this.renderContent = true;
    this.isExpanded = true;
    this._afterExpand();
  }

  _afterExpand() {
    this.args.onAfterExpand?.();
  }

  _expandWithTransition() {
    this.renderContent = true;
    this.isExpanded = true;
    this.isTransitioning = true;

    return waitForPromise(
      this._waitForFrame()
        .then(() => this._adjustToZeroHeight())
        .then(() => this._waitForFrame())
        .then(() => this._adjustToScrollHeight())
        .then(() => this._waitForTransition())
        .then(() => this._adjustToNoneHeight())
        .then(() => this._afterExpandWithTransition()),
      '@zestia/ember-expander:expand'
    );
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

  _waitForFrame() {
    return new Promise(requestAnimationFrame);
  }

  _waitForTransition() {
    this.transition = defer();
    return this.transition.promise;
  }
}
