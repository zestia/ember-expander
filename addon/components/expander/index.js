import Component from '@glimmer/component';
import ExpanderContent from './content';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { waitFor } from '@ember/test-waiters';
import Modifier from 'ember-modifier';
import { helper } from '@ember/component/helper';
import { waitForFrame, waitForAnimation } from '@zestia/animation-utils';
const { assign } = Object;

export class LifecycleHooks extends Modifier {
  didInstall() {
    this.args.named.didInstall(this.element);
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
      Content: this.Content,
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

  get canCollapse() {
    return this.isExpanded && !this.isTransitioning;
  }

  get canExpand() {
    return !this.isExpanded && !this.isTransitioning;
  }

  handleInsertElement = () => {
    this.args.onReady?.(this.api);
    this._handleManualState();
  };

  handleUpdateArguments = () => {
    this._handleManualState();
  };

  registerContentElement = (element) => {
    this.contentElement = element;
  };

  @waitFor
  expand = async () => {
    if (!this.canExpand) {
      return;
    }

    this.renderContent = true;
    this.isExpanded = true;
    this._adjustToZeroHeight();
    await waitForFrame();
    this._adjustToScrollHeight();
    this.isTransitioning = true;
    await this._waitForTransition();
    this.isTransitioning = false;
    this._adjustToNoneHeight();
    this.args.onExpanded?.();
  };

  @waitFor
  collapse = async () => {
    if (!this.canCollapse) {
      return;
    }

    this.isExpanded = false;
    this._adjustToScrollHeight();
    await waitForFrame();
    this._adjustToZeroHeight();
    this.isTransitioning = true;
    await this._waitForTransition();
    this.isTransitioning = false;
    this._adjustToNoneHeight();
    this.renderContent = false;
    this.args.onCollapsed?.();
  };

  toggle = () => {
    if (this.renderContent) {
      this.collapse();
    } else {
      this.expand();
    }
  };

  _handleManualState() {
    // if (this.args.expanded === this.isExpanded) {
    //   return;
    // }

    console.log('here', this.isExpanded);

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

export default ExpanderComponent;
