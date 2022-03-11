# @zestia/ember-expander

<p>
  <!--
  <a href="https://github.com/zestia/ember-expander/actions/workflows/ci.yml">
    <img src="https://github.com/zestia/ember-expander/actions/workflows/ci.yml/badge.svg">
  </a>
  -->

  <a href="https://david-dm.org/zestia/ember-expander#badge-embed">
    <img src="https://david-dm.org/zestia/ember-expander.svg">
  </a>

  <a href="https://david-dm.org/zestia/ember-expander#dev-badge-embed">
    <img src="https://david-dm.org/zestia/ember-expander/dev-status.svg">
  </a>

  <a href="https://emberobserver.com/addons/@zestia/ember-expander">
    <img src="https://emberobserver.com/badges/-zestia-ember-expander.svg">
  </a>

  <img src="https://img.shields.io/badge/Ember-%3E%3D%203.16-brightgreen">
</p>

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

## Example

```handlebars
<Expander as |expander|>
  <button {{on 'click' expander.toggleWithTransition}}>
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
2. zero (transitioning)
3. scroll height (transitioning)
4. none (expanded)

When collapsing, `max-height` goes from:

1. none (expanded)
2. scroll height (transitioning)
3. zero (transitioning)
4. none (collapsed)

Notice that the `max-height` style is only present for the duration of the transition.

This is so that if the contents of your element change it can still grow or shrink to fit that new content - without causing an additional transition.
