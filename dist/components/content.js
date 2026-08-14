import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';

class DragulaContainer extends Component {
  lifecycle = modifier(element => {
    this.args.onInsert(element);
  });
  static {
    setComponentTemplate(precompileTemplate("<div class=\"expander__content\" style={{@style}} {{this.lifecycle}} ...attributes>\n  {{yield}}\n</div>", {
      strictMode: true
    }), this);
  }
}

export { DragulaContainer as default };
//# sourceMappingURL=content.js.map
