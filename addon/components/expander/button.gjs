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
