import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ApplicationController extends Controller {
  @tracked show = true;
  @tracked more = false;

  @action
  toggle() {
    this.show = !this.show;
  }

  @action
  toggleMore() {
    this.more = !this.more;
  }
}
