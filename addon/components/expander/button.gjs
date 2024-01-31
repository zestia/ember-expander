/* https://github.com/ember-cli/eslint-plugin-ember/issues/2035 */
/* eslint-disable no-unused-expressions */

<template>
  <button
    type="button"
    class="expander__button"
    aria-controls="{{@aria-controls}}"
    aria-expanded="{{@aria-expanded}}"
    ...attributes
  >
    {{yield}}
  </button>
</template>
