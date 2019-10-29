# @zestia/ember-expander

<a href="https://badge.fury.io/js/%40zestia%2Fember-expander"><img src="https://badge.fury.io/js/%40zestia%2Fember-expander.svg" alt="npm version" height="18"></a> &nbsp; <a href="http://travis-ci.org/zestia/ember-expander"><img src="https://travis-ci.org/zestia/ember-expander.svg?branch=master"></a> &nbsp; <a href="https://david-dm.org/zestia/ember-expander#badge-embed"><img src="https://david-dm.org/zestia/ember-expander.svg"></a> &nbsp; <a href="https://david-dm.org/zestia/ember-expander#dev-badge-embed"><img src="https://david-dm.org/zestia/ember-expander/dev-status.svg"></a> &nbsp; <a href="https://emberobserver.com/addons/@zestia/ember-expander"><img src="https://emberobserver.com/badges/-zestia-ember-expander.svg"></a>

Transitioning an element from a zero height to it's actual height is not possible to do well with pure CSS (at time of writing).

This component has a `max-height` style with the correct maximum height set, so that transitioning to that value works correctly.

It also has the added benefit of not rendering the content when collapsed, which results in faster _initial_ rendering.

Expanding goes from:

1. zero height (collapsed)
2. scroll height (transitioning)
3. none height (expanded)

Notice that the maximum height style is only present for the duration of the transition. This is so that if content is added or removed, the element can still grow or shrink to fit that new content - without causing an additional transition.

Collapsing goes from:

1. scroll height (expanded)
2. zero height (transitoning)
3. none height (collapsed)

...and remains as such, because the element is then removed from the DOM.

## Demo

https://zestia.github.io/ember-expander

## Installation

```
ember install @zestia/ember-expander
```

## Usage

```handlebars
<Expander as |expander|>
  <button {{on "click" expander.toggleWithTransition}}>
    Toggle
  </button>
  <expander.Content>
    Hello World
  </expander.Content>
</Expander>
```

#### Info

- This addon does not (and will never) come with any styles.
- You can nest Expanders.
