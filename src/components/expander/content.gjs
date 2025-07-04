import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';

export default class DragulaContainer extends Component {
  lifecycle = modifier((element) => {
    this.args.onInsert(element);
  });

  <template>
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
