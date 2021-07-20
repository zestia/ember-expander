import Component from '@glimmer/component';
import ExpanderContent from './content';
import { scheduleOnce } from '@ember/runloop';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { Promise, defer } from 'rsvp';
const { requestAnimationFrame } = window;

export default class ExpanderComponent extends Component {
  ready = false;

  @tracked maxHeight = null;
  @tracked isExpanded = false;
  @tracked isTransitioning = false;
  @tracked renderContent = false;

  willTransition = defer();

  ExpanderContent = ExpanderContent;

  ready = modifier((element, [api]) => {
    if (!this.ready) {
      this.args.onReady?.(api);
    }
  });

  expandOrCollapse = modifier((element, [expanded]) => {
    if (expanded === true) {
      this._expand();
    } else if (expanded === false) {
      this._collapse();
    }
  });

  get style() {
    let style = '';

    if (this.maxHeight !== null) {
      style = `max-height: ${this.maxHeight}px`;
    }

    return htmlSafe(style);
  }

  @action
  handleTransitionEnd(event) {
    if (
      event.target === this.contentElement &&
      event.propertyName === 'max-height'
    ) {
      this.willTransition.resolve();
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
    this.args.onAfterCollapse?.();
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

  _waitForRender() {
    return new Promise((resolve) => scheduleOnce('afterRender', this, resolve));
  }

  _waitForFrame() {
    return new Promise(requestAnimationFrame);
  }

  _waitForTransition() {
    this.willTransition = defer();
    return this.willTransition.promise;
  }
}
