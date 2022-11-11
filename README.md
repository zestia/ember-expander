# @zestia/ember-expander

[![Latest npm release][npm-badge]][npm-badge-url]
[![Ember Observer][ember-observer-badge]][ember-observer-url]

<!-- [![GitHub Actions][github-actions-badge]][github-actions-url] -->

[npm-badge]: https://img.shields.io/npm/v/@zestia/ember-expander.svg
[npm-badge-url]: https://www.npmjs.com/package/@zestia/ember-expander
[github-actions-badge]: https://github.com/zestia/ember-expander/workflows/CI/badge.svg
[github-actions-url]: https://github.com/zestia/ember-expander/actions
[ember-observer-badge]: https://emberobserver.com/badges/-zestia-ember-expander.svg
[ember-observer-url]: https://emberobserver.com/addons/@zestia/ember-expander

Transitioning an element from a zero height to it's actual height is not possible to do with pure CSS, unless you know the height in advance.

This component automatically sets `max-height`, so that you can style transitions _to that height_.

## Installation

```
ember install @zestia/ember-expander
```

## Demo

https://zestia.github.io/ember-expander/

## Features

- Fixes ["css transition to height auto"](https://google.com/search?q=css+transition+to+height+auto) ✔︎
- Lazy content ✔︎
- Cancellable transitions ✔︎
- Nested expanders ✔︎

## Notes

- This addon intentionally does not come with any styles.
- It is configured with [ember-test-waiters](https://github.com/emberjs/ember-test-waiters) so `await`ing in your test suite will just work.

## Example

```handlebars
<Expander as |expander|>
  <button {{on 'click' expander.toggle}}>
    Toggle
  </button>
  <expander.Content>
    Hello World
  </expander.Content>
</Expander>
```

## Arguments

### `@expanded`

Optional. Expanders are rendered as collapsed by default. Use this argument to manually control their expanded/collapsed state.

### `@onReady`

Optional. This action exposes an API for full control over an Expander.

### `@onExpanded`

Optional. This action fires after the content has rendered and the transition to reveal that content has finished.

### `@onCollapse`

Optional. This action fires after the transition to hide the content has finished, and the content has been removed from the DOM.

## API

### `toggle`

Toggles the expanded/collapsed state

### `expand`

Expands to reveal the content

### `collapse`

Collapses the content, and un-renders it

### `isExpanded`

Whether or not the content is showing

### `isTransitioning`

Whether or not a transition is in progress to reveal or hide the content.

## Further explanation

- When expanding, the component will automatically set the `max-height`. This allows you to use a CSS transition to expand to full height, and reveal the content. `max-height` goes from:

  - none (collapsed)
  - zero (required to start the transition)
  - scroll height (the destination of the transition)
  - none (expanded)

  The max-height is removed after expansion, this is so that if the contents of your element subsequently changes, the DOM element can still grow or shrink to fit that new content - without cutting it off, or causing an accidental transition.

* When collapsing, the component will automatically set the `max-height`. This allows you to use a CSS transition to collapse to zero, hiding the content. `max-height` goes from:

  - none (expanded)
  - scroll height (required to start the transition)
  - zero (the destination of the transition)
