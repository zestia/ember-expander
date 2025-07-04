import Route from 'ember-route-template';
import Expander from '@zestia/ember-expander/components/expander';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import '../styles/app.css';

class ApplicationRoute extends Component {
  @tracked show = true;
  @tracked more = false;

  toggle = () => (this.show = !this.show);
  toggleMore = () => (this.more = !this.more);

  <template>
    <h1>
      @zestia/ember-expander
    </h1>

    <h4>
      Demo
    </h4>

    <div class="demo">
      <Expander as |expander|>
        <expander.Button {{on "click" expander.toggle}}>
          Toggle
        </expander.Button>

        <button type="button" {{on "click" this.toggleMore}}>
          Toggle more content
        </button>

        <expander.Content>
          Hello
          <br />
          World
          {{#if this.more}}
            <br />
            More content
          {{/if}}
        </expander.Content>
      </Expander>

      <h4>
        Pre-expanded
      </h4>

      <Expander @expanded={{true}} as |expander|>
        <expander.Button {{on "click" expander.toggle}}>
          Toggle
        </expander.Button>

        <expander.Content>
          Hello
          <br />
          World
        </expander.Content>
      </Expander>

      <h4>
        Nested
      </h4>

      <Expander as |expander|>
        <expander.Button {{on "click" expander.toggle}}>
          Toggle
        </expander.Button>
        <expander.Content>
          <Expander as |expander|>
            <expander.Button {{on "click" expander.toggle}}>
              Toggle
            </expander.Button>

            <expander.Content>
              Hello
              <br />
              World
            </expander.Content>
          </Expander>
        </expander.Content>
      </Expander>
    </div>

    {{outlet}}

    {{! template-lint-disable no-inline-styles }}
    <a href="https://github.com/zestia/ember-expander">
      <img
        style="position: absolute; top: 0; right: 0; border: 0;"
        width="149"
        height="149"
        src="https://github.blog/wp-content/uploads/2008/12/forkme_right_darkblue_121621.png?resize=149%2C149"
        class="attachment-full size-full"
        alt="Fork me on GitHub"
        data-recalc-dims="1"
      />
    </a>
  </template>
}

export default Route(ApplicationRoute);
