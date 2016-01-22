Redux Sounds
============

[![build status](https://img.shields.io/travis/joshwcomeau/redux-sounds/master.svg?style=flat-square)](https://travis-ci.org/joshwcomeau/redux-sounds)
[![npm version](https://img.shields.io/npm/v/redux-sounds.svg?style=flat-square)](https://www.npmjs.com/package/redux-sounds)


Redux [middleware](http://rackt.org/redux/docs/advanced/Middleware.html) that lets you easily trigger sound effects on actions. Makes it completely trivial to do so, by adding a `meta` property to any action:

```js
export function danceMoves() {
  return {
    type: 'DANCE_MOVES',
    meta: { sound: 'groovy_music' }
  }
}
```


## Installation

```js
npm i -S redux-sounds
```

## Setup

// TODO

## Usage

// TODO

## Troubleshooting

// TODO

## License

[MIT](https://github.com/joshwcomeau/redux-sounds/blob/master/LICENSE.md)
