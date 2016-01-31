Redux Sounds
============

[![build status](https://img.shields.io/travis/joshwcomeau/redux-sounds/master.svg?style=flat-square)](https://travis-ci.org/joshwcomeau/redux-sounds)
[![npm version](https://img.shields.io/npm/v/redux-sounds.svg?style=flat-square)](https://www.npmjs.com/package/redux-sounds)


Redux [middleware](http://rackt.org/redux/docs/advanced/Middleware.html) that lets you easily trigger sound effects on actions. Makes it completely trivial to do so, by adding a `meta` property to any action:

```js
export function danceMoves() {
  return {
    type: 'DANCE_MOVES',
    meta: { sound: 'groovyMusic' }
  }
}
```

Uses [Howler.js](https://github.com/goldfire/howler.js/) under the hood, which uses [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) when available, with a graceful fallback to [HTML5 Audio](https://en.wikipedia.org/wiki/HTML5_Audio).


## Installation

#### Preferred: NPM

```js
npm i -S redux-sounds
```


#### Also available: UMD

UMD builds are also available, for single-file usage or quick hacking in a JSbin. Simply add `dist/redux-sounds.js` or `dist/redux-sounds.min.js` to your file in a `<script>` tag. The middleware will be available under `ReduxSounds`.


## Setup

`soundsMiddleware` works similarly to other Redux middleware, with one important exception: it needs to be pre-loaded with sound data.

Here's an example setup:

```js
/* configure-store.js */

import { createStore, combineReducers, applyMiddleware } from 'redux';
import soundsMiddleware from 'redux-sounds';

import { gameReducer } from '../reducers/game-reducer';

// Our soundsData is an object. The keys are the names of our sounds.
const soundsData = {
  // If no additional configuration is necessary, we can just pass a string
  // as the path to our file.
  endTurn: 'https://s3.amazonaws.com/bucketName/end_turn.mp3',

  // Alternatively, we can pass a configuration object.
  // All valid howler.js options can be used here.
  winGame: {
    urls: [
      'https://s3.amazonaws.com/bucketName/win_game.mp3',
      'https://s3.amazonaws.com/bucketName/win_game.wav'
    ],
    volume: 0.75
  }
}

// Pre-load our middleware with our sounds data.
const loadedSoundsMiddleware = soundsMiddleware(soundsData);

// Use as you would any other middleware.
const store = createStore(gameReducer, applyMiddleware(loadedSoundsMiddleware));
// (Using the condensed createStore released in Redux v3.1.0)
```

Howler has much more advanced capabilities, including using sound sprites, specifying callbacks to run when the sound has completed, looping sounds, fading in/out, and much more. See [their documentation](https://github.com/goldfire/howler.js/#properties) for the complete list.


## Usage

Once your store is created, dispatching actions that trigger sounds is simple.

Using the convention established in the [rafScheduler Middleware example](https://github.com/rackt/redux/blob/46083e73d952feb367bf3fa4e13c1e419a224100/docs/advanced/Middleware.md#seven-examples), a new `meta` property can be attached to actions. This `meta` property should have a `sound` key, and its value should be that of a registered sound.

If the setup process above was followed, we have two sounds we can trigger: `endTurn` and `winGame`. To trigger:

```js
/* game-actions.js */

export function endTurn() {
  return {
    type: 'END_TURN',
    meta: { sound: 'endTurn' }
  }
}

export function winGame() {
  return {
    type: 'WIN_GAME',
    meta: { sound: 'winGame' }
  }
}

```

It is worth noting that it is unlikely that you'll need to create new actions for your sound effects; You'll probably want to just add `meta` properties to pre-existing actions, so that they play a sound in addition to whatever else they do (change the reducer state, trigger other middleware, etc).


## Troubleshooting

#### I get a console warning when I dispatch an action.

When you dispatch an action with a `meta.sound` property, redux-sounds looks for a registered sound under that name. If it cannot find one, you'll get a console warning:

    The sound 'foo' was requested, but redux-sounds doesn't have anything registered under that name.

To understand why this is happening, let's examine the link between registering a sound when the store is created, and triggering a sound when an action is dispatched.

When you create your store, you pass in an object like so:
```js
const soundsData = {
  foo: 'path/to/foo.mp3'
};
```

The keys in that object must correspond to the value specified when you dispatch your action:
```js
dispatch({
  type: 'ACTION_NAME',
  meta: { sound: 'foo' }
});
```

Make sure these two values are the same!

#### A `missingSoundData` error throws when I try loading the page.

Unlike other middleware, you cannot simply pass it to Redux as-is:
```js
import soundsMiddleware from 'redux-sounds';

// DON'T do this:
const store = createStore(rootReducer, applyMiddleware(soundsMiddleware));
```

The reason for this is that before the store can be registered, you need to pass it data about which sounds it needs to handle.

You must first invoke `soundsMiddleware` with a `soundsData` object:

```js
import soundsMiddleware from 'redux-sounds';
import { soundsData } from '../data/sounds';

// Important step:
const loadedSoundsMiddleware = soundsMiddleware(soundsData);

const store = createStore(rootReducer, applyMiddleware(loadedSoundsMiddleware));
```

## Planned functionality

The biggest feature I feel is missing from this implementation is a way to interrupt/stop sounds once they've started. I'd like to implement the ability to dispatch an action that _stops_ a sound.

Got ideas for must-have functionality? Create an issue and let's discuss =)


## Contributions

Contributors welcome!


## License

[MIT](https://github.com/joshwcomeau/redux-sounds/blob/master/LICENSE.md)
