# @zestia/ember-expander

[![Latest npm release][npm-badge]][npm-badge-url]
[![GitHub Actions][github-actions-badge]][github-actions-url]
[![Ember Observer][ember-observer-badge]][ember-observer-url]

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

## Notes

- This addon intentionally does not come with any styles.
- You can nest Expanders.
- Content is not rendered when collapsed, which results in faster rendering.
- Transitions/animations can be interrupted part way through

## Usage

Control the content area by using the yielded API: `expand`, `collapse` and `toggle`. Or alternatively, use the `@expanded` argument.

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

## Further explanation

When expanding, `max-height` goes from:

1. none (collapsed)
2. zero (required to start the transition)
3. scroll height (the destination of the transition)
4. none (expanded)

When collapsing, `max-height` goes from:

1. none (expanded)
2. scroll height (required to start the transition)
3. zero (the destination of the transition)

Notice that the `max-height` style is only present for the duration of the transition.

This is so that if the contents of your element change it can still grow or shrink to fit that new content - without causing an additional transition.
