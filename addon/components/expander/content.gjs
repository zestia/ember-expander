/* https://github.com/ember-cli/eslint-plugin-ember/issues/2035 */
/* eslint-disable no-unused-expressions */

import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';

export default class DragulaContainer extends Component {
  lifecycle = modifier((element) => {
    this.args.onInsert(element);
  });

  <template>
    {{! template-lint-disable no-inline-styles }}
    {{! Issue: https://github.com/emberjs/rfcs/issues/497 }}

    <div
      class="expander__content"
      style={{@style}}
      {{this.lifecycle}}
      ...attributes
    >
      {{yield}}
    </div>
  </template>
}
