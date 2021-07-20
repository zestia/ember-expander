import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';

export default class ExpanderContentComponent extends Component {
  lifecycleActions = modifier((element) => {
    this.args.onInsert(element);
  });
}
