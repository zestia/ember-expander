import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';

var ExpanderButton = setComponentTemplate(precompileTemplate("<button type=\"button\" class=\"expander__button\" aria-controls=\"{{@aria-controls}}\" aria-expanded=\"{{@aria-expanded}}\" ...attributes>\n  {{yield}}\n</button>", {
  strictMode: true
}), templateOnly());

export { ExpanderButton as default };
//# sourceMappingURL=button.js.map
