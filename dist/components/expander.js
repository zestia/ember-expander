import { guidFor } from '@ember/object/internals';
import { hash } from '@ember/helper';
import { htmlSafe } from '@ember/template';
import { next, scheduleOnce } from '@ember/runloop';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { waitFor } from '@ember/test-waiters';
import { waitForAnimation } from '@zestia/animation-utils';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import ExpanderButton from './button.js';
import DragulaContainer from './content.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { g, i } from 'decorator-transforms/runtime-esm';

/* eslint-disable ember/no-runloop */
const {
  assign
} = Object;
class ExpanderComponent extends Component {
  static {
    g(this.prototype, "isExpanded", [tracked], function () {
      return !!this.args.expanded;
    });
  }
  #isExpanded = (i(this, "isExpanded"), void 0);
  static {
    g(this.prototype, "isTransitioning", [tracked], function () {
      return false;
    });
  }
  #isTransitioning = (i(this, "isTransitioning"), void 0);
  static {
    g(this.prototype, "maxHeight", [tracked], function () {
      return null;
    });
  }
  #maxHeight = (i(this, "maxHeight"), void 0);
  static {
    g(this.prototype, "renderContent", [tracked], function () {
      return !!this.args.expanded;
    });
  }
  #renderContent = (i(this, "renderContent"), void 0);
  Button;
  Content;
  contentElement = null;
  didSetUp;
  id = guidFor(this);
  registerComponents = components => {
    assign(this, components);
  };
  get style() {
    let style = '';
    if (this.maxHeight !== null) {
      style = `max-height: ${this.maxHeight}px`;
    }
    return htmlSafe(style);
  }
  lifecycle = modifier((element, [expanded]) => {
    if (!this.didSetUp) {
      this.handleInsertElement();
      this.didSetUp = true;
    }
    this.handleUpdatedArguments({
      expanded
    });
  });
  handleInsertElement = () => {
    this.args.onReady?.(this.api);
  };
  handleUpdatedArguments = ({
    expanded
  }) => {
    next(() => this.#handleManualState(expanded));
  };
  registerContentElement = element => {
    this.contentElement = element;
  };
  expand = async () => {
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
    } catch {
      // squelch
    }
  };
  collapse = async () => {
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
    } catch {
      // squelch
    }
  };
  toggle = () => {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  };
  _expand = task(waitFor(async () => {
    this.renderContent = true;
    this.isExpanded = true;
    this.maxHeight = 0;
    await this.#waitForRender();
    this.maxHeight = this.contentElement.scrollHeight;
    this.isTransitioning = true;
    await this.#waitForTransition();
    this.isTransitioning = false;
    this.maxHeight = null;
  }));
  _collapse = task(waitFor(async () => {
    this.isExpanded = false;
    this.maxHeight = this.contentElement.scrollHeight;
    await this.#waitForRender();
    this.contentElement.getBoundingClientRect();
    this.maxHeight = 0;
    this.isTransitioning = true;
    await this.#waitForTransition();
    this.isTransitioning = false;
    this.renderContent = false;
    this.maxHeight = null;
  }));
  #handleManualState(bool) {
    if (bool === true) {
      this.expand();
    } else if (bool === false) {
      this.collapse();
    }
  }
  #waitForRender() {
    return new Promise(resolve => {
      scheduleOnce('afterRender', resolve);
    });
  }
  #waitForTransition() {
    return waitForAnimation(this.contentElement, {
      transitionProperty: 'max-height',
      maybe: true
    });
  }
  get #api() {
    return {
      Button: this.Button,
      Content: this.renderContent ? this.Content : null,
      contentElement: this.contentElement,
      toggle: this.toggle,
      expand: this.expand,
      collapse: this.collapse,
      isExpanded: this.isExpanded,
      isTransitioning: this.isTransitioning
    };
  }
  api = new Proxy(this, {
    get(target, key) {
      return target.#api[key];
    },
    set() {}
  });
  static {
    setComponentTemplate(precompileTemplate("{{!-- template-lint-disable no-unsupported-role-attributes --}}\n{{this.registerComponents (hash Button=(component ExpanderButton aria-controls=this.id aria-expanded=this.isExpanded) Content=(component ExpanderContent onInsert=this.registerContentElement style=this.style))}}\n<div id={{this.id}} class=\"expander\" data-transitioning=\"{{this.isTransitioning}}\" data-expanded=\"{{this.isExpanded}}\" role=\"region\" ...attributes {{this.lifecycle @expanded}}>\n  {{yield this.api}}\n</div>", {
      strictMode: true,
      scope: () => ({
        hash,
        ExpanderButton,
        ExpanderContent: DragulaContainer
      })
    }), this);
  }
}

export { ExpanderComponent as default };
//# sourceMappingURL=expander.js.map
