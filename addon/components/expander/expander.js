import Component from '@glimmer/component';
import { scheduleOnce } from '@ember/runloop';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { tracked } from '@glimmer/tracking';
import { Promise } from 'rsvp';
const { requestAnimationFrame } = window;

export default class ExpanderComponent extends Component {
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
    this._invokeAction('onReady', api);
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
    if (!this._canCollapse()) {
      return;
    }

    this.isExpanded = false;
    this._afterCollapse();
  }

  _afterCollapse() {
    this.renderContent = false;
    this._invokeAction('onAfterCollapse');
  }

  _collapseWithTransition() {
    if (!this._canCollapse()) {
      return;
    }

    this.isExpanded = false;
    this.isTransitioning = true;

    return this._waitForFrame()
      .then(() => this._adjustToScrollHeight())
      .then(() => this._waitForFrame())
      .then(() => this._adjustToZeroHeight())
      .then(() => this._waitForTransition())
      .then(() => this._adjustToNoneHeight())
      .then(() => this._afterCollapseWithTransition());
  }

  _afterCollapseWithTransition() {
    this.renderContent = false;
    this.isTransitioning = false;

    this._invokeAction('onAfterCollapseTransition');
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
    this._invokeAction('onAfterExpand');
  }

  _expandWithTransition() {
    if (!this._canExpand()) {
      return;
    }

    this.renderContent = true;
    this.isExpanded = true;
    this.isTransitioning = true;

    return this._waitForRender()
      .then(() => this._adjustToZeroHeight())
      .then(() => this._waitForFrame())
      .then(() => this._adjustToScrollHeight())
      .then(() => this._waitForTransition())
      .then(() => this._adjustToNoneHeight())
      .then(() => this._afterExpandWithTransition());
  }

  _afterExpandWithTransition() {
    this.isTransitioning = false;

    this._invokeAction('onAfterExpandTransition');
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

  _waitForRender() {
    return new Promise((resolve) => scheduleOnce('afterRender', this, resolve));
  }

  _waitForFrame() {
    return new Promise(requestAnimationFrame);
  }

  _waitForTransition() {
    return new Promise((resolve) => {
      const handler = (e) => {
        if (e.propertyName === 'max-height') {
          resolve();
          this.contentElement.removeEventListener('transitionend', handler);
        }
      };

      this.contentElement.addEventListener('transitionend', handler);
    });
  }

  _invokeAction(name, ...args) {
    const action = this.args[name];

    if (typeof action === 'function') {
      action(...args);
    }
  }
}
