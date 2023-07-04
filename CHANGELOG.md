# Changelog

## 4.6.1

- Run `ember-cli-update`

## 4.5.1

- Allow the addon to work when there is no transition

## 4.5.0

- Remove `tabindex="0"`
- Add `role="region"`
- Swap `aria-expanded` for `data-expanded` and updated example usage
- Yield button to control expanding
- Use function helpers
- Update animation utils

## 4.4.1

- Expose `contentElement` on the API

## 4.4.0

- Remove BEM classes in favour of data attributes

## 4.3.0

- Ember Auto Import 2x
- Upgrade dependencies
- Run ember-cli-update

## 4.2.1

- Make sure yielded API is up to date

## 4.2.0

- Skip expand code if initially expanded

## 4.1.1

- Upgrade `@zestia/animation-utils`

## 4.1.0

- Use ember concurrency to allow expanding/collapsing mid-way (Re-attempt of 3.1.0)

## 4.0.3

- Add `tabindex="0"`

## 4.0.2

- Upgrade embroider dependencies

## 4.0.1

- Correct app re-exports

## 4.0.0

- Reduce API to just `expand`, `collapse`, and `toggle`

## 3.3.1

- Bump `@zestia/animation-utils`

## 3.3.0

- Utilise `@zestia/animation-utils`
- Upgrade dependencies
- Revert changes from 3.1.0

## 3.2.2

- Add debug label to test waiter

## 3.2.1

- Clear transition deferred once used

## 3.2.0

- The expand/collapse actions use a test waiter, and so are aware of the transitions.

## 3.1.0

- Allow expanding/collapsing, even if already expanding/collapsing

## 3.0.0

- Upgrade dependencies
- Add Embroider support
- Simplify waiting for transition
- Remove expanded/collapsed class names

## 2.1.5

- Upgrade dependencies

## 2.1.4

- Upgrade dependencies
- Run ember-cli-update

## 2.1.3

- Upgrade dependencies

## 2.1.2

- Expose `isTransitioning` on API

## 2.1.1

- Return promises from API actions

## 2.1.0

- Exposes API via `onReady` action

## 2.0.5

- Upgrade dependencies

## 2.0.4

- Upgrade dependencies

## 2.0.3

- Upgrade dependencies

## 2.0.2

- Upgrade dependencies

## 2.0.1

- Move glimmer from devDeps to deps

## 2.0.0

- Glimmerise component
- Drop support for Ember < 3.16

## 1.0.3

- Upgrade dependencies

## 1.0.2

- Re-publish

## 1.0.1

- Use `trySet` in case component is destroyed mid-expand/collapse

## 1.0.0

- Bump version number

## 0.2.1

- Upgrade dependencies

## 0.2.0

- Don't send element out with the actions

## 0.1.0

- Initial release
