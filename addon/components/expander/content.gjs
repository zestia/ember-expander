/* https://github.com/ember-cli/eslint-plugin-ember/issues/2035 */
/* eslint-disable no-unused-expressions */

import didInsert from '@ember/render-modifiers/modifiers/did-insert';

<template>
  {{! template-lint-disable no-inline-styles }}
  {{! Issue: https://github.com/emberjs/rfcs/issues/497 }}

  <div
    class="expander__content"
    style={{@style}}
    ...attributes
    {{didInsert @onInsert}}
  >
    {{yield}}
  </div>
</template>
