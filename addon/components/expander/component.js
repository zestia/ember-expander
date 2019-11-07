import Component from '@ember/component';
import layout from './template';
import { scheduleOnce } from '@ember/runloop';
import { computed, set, action } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { Promise } from 'rsvp';
const { requestAnimationFrame } = window;

export default class ExpanderComponent extends Component {
  layout = layout;
  tagName = '';

  maxHeight = null;
  isExpanded = false;
  isTransitioning = false;
  renderContent = false;

  onAfterExpand() {}
  onAfterExpandTransition() {}
  onAfterCollapse() {}
  onAfterCollapseTransition() {}

  @computed('maxHeight')
  get style() {
    let style = '';

    if (this.maxHeight !== null) {
      style = `max-height: ${this.maxHeight}px`;
    }

    return htmlSafe(style);
  }

  @action
  handleInsert() {
    this._handleManualState();
  }

  @action
  handleUpdate() {
    this._handleManualState();
  }

  @action
  expand() {
    this._expand();
  }

  @action
  expandWithTransition() {
    this._expandWithTransition();
  }

  @action
  collapse() {
    this._collapse();
  }

  @action
  collapseWithTransition() {
    this._collapseWithTransition();
  }

  @action
  toggle() {
    this._toggle();
  }

  @action
  toggleWithTransition(e) {
    this._toggleWithTransition();
  }

  @action
  registerContentElement(element) {
    set(this, 'contentElement', element);
  }

  _handleManualState() {
    if (this.expanded === true) {
      this._expand();
    } else if (this.expanded === false) {
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

    set(this, 'isExpanded', false);
    this._afterCollapse();
  }

  _afterCollapse() {
    set(this, 'renderContent', false);
    this.onAfterCollapse();
  }

  _collapseWithTransition() {
    if (!this._canCollapse()) {
      return;
    }

    set(this, 'isExpanded', false);
    set(this, 'isTransitioning', true);

    this._waitForFrame()
      .then(() => this._adjustToScrollHeight())
      .then(() => this._waitForFrame())
      .then(() => this._adjustToZeroHeight())
      .then(() => this._waitForTransition())
      .then(() => this._adjustToNoneHeight())
      .then(() => this._afterCollapseWithTransition());
  }

  _afterCollapseWithTransition() {
    set(this, 'renderContent', false);
    set(this, 'isTransitioning', false);

    this.onAfterCollapseTransition();
  }

  _canExpand() {
    return !this.isExpanded && !this.isTransitioning;
  }

  _expand() {
    if (!this._canExpand()) {
      return;
    }

    set(this, 'renderContent', true);
    set(this, 'isExpanded', true);
    this._afterExpand();
  }

  _afterExpand() {
    this.onAfterExpand();
  }

  _expandWithTransition() {
    if (!this._canExpand()) {
      return;
    }

    set(this, 'renderContent', true);
    set(this, 'isExpanded', true);
    set(this, 'isTransitioning', true);

    this._waitForRender()
      .then(() => this._adjustToZeroHeight())
      .then(() => this._waitForFrame())
      .then(() => this._adjustToScrollHeight())
      .then(() => this._waitForTransition())
      .then(() => this._adjustToNoneHeight())
      .then(() => this._afterExpandWithTransition());
  }

  _afterExpandWithTransition() {
    set(this, 'isTransitioning', false);

    this.onAfterExpandTransition();
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
      this._collapseWithTransition();
    } else {
      this._expandWithTransition();
    }
  }

  _adjustToZeroHeight() {
    set(this, 'maxHeight', 0);
  }

  _adjustToNoneHeight() {
    set(this, 'maxHeight', null);
  }

  _adjustToScrollHeight() {
    set(this, 'maxHeight', this.contentElement.scrollHeight);
  }

  _waitForRender() {
    return new Promise(resolve => scheduleOnce('afterRender', this, resolve));
  }

  _waitForFrame() {
    return new Promise(requestAnimationFrame);
  }

  _waitForTransition() {
    return new Promise(resolve => {
      const handler = e => {
        if (e.propertyName === 'max-height') {
          resolve();
          this.contentElement.removeEventListener('transitionend', handler);
        }
      };

      this.contentElement.addEventListener('transitionend', handler);
    });
  }
}
