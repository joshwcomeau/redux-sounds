# Redux Sounds

[![build status](https://img.shields.io/travis/joshwcomeau/redux-sounds/master.svg?style=flat-square)](https://travis-ci.org/joshwcomeau/redux-sounds)
[![npm version](https://img.shields.io/npm/v/redux-sounds.svg?style=flat-square)](https://www.npmjs.com/package/redux-sounds)
[![Coverage Status](https://coveralls.io/repos/github/joshwcomeau/redux-sounds/badge.svg?branch=master&cache=buster)](https://coveralls.io/github/joshwcomeau/redux-sounds?branch=master)

Redux [middleware](http://rackt.org/redux/docs/advanced/Middleware.html) that lets you easily trigger sound effects on actions. Makes it completely trivial to do so, by adding a `meta` property to any action:

```javascript
export function danceMoves() {
  return {
    type: 'DANCE_MOVES',
    meta: {
      sound: {
        play: 'groovyMusic'
      }
    }
  };
}
```

Uses [Howler.js](https://github.com/goldfire/howler.js/) under the hood, which uses [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) when available, with a graceful fallback to [HTML5 Audio](https://en.wikipedia.org/wiki/HTML5_Audio).

## Installation

#### Preferred: NPM

```
npm i -S redux-sounds
```

#### Also available: UMD

UMD builds are also available, for single-file usage or quick hacking in a JSbin. Simply add `dist/redux-sounds.js` or `dist/redux-sounds.min.js` to your file in a `<script>` tag. The middleware will be available under `ReduxSounds`.

## Setup

`soundsMiddleware` works similarly to other Redux middleware, and can be pre-loaded with sound data.

Here's an example setup:

```javascript
/* configure-store.js */

import { createStore, combineReducers, applyMiddleware } from 'redux';
import soundsMiddleware from 'redux-sounds';

import { gameReducer } from '../reducers/game-reducer';

// Our soundsData is an object. The keys are the names of our sounds.
const soundsData = {
  // If no additional configuration is necessary, we can just pass a string  as the path to our file.
  endTurn: 'https://s3.amazonaws.com/bucketName/end_turn.mp3',

  // Alternatively, we can pass a configuration object.
  // All valid howler.js options can be used here.
  winGame: {
    src: [
      'https://s3.amazonaws.com/bucketName/win_game.mp3',
      'https://s3.amazonaws.com/bucketName/win_game.wav'
    ],
    volume: 0.75
  },

  // Audio sprites are supported. They follow the Howler.js spec.
  // Each sprite has an array with two numbers:
  //   - the start time of the sound, in milliseconds
  //   - the duration of the sound, in milliseconds
  jumps: {
    src: ['https://s3.amazonaws.com/bucketName/jumps.mp3'],
    sprite: {
      lowJump: [0, 1000],
      longJump: [1000, 2500],
      antiGravityJump: [3500, 10000]
    }
  }
};

// Pre-load our middleware with our sounds data.
const loadedSoundsMiddleware = soundsMiddleware(soundsData);

// Use as you would any other middleware.
const store = createStore(gameReducer, applyMiddleware(loadedSoundsMiddleware));
// (Using the condensed createStore released in Redux v3.1.0)
```

Howler has much more advanced capabilities, including specifying callbacks to run when the sound has completed (or failed to complete), looping sounds, fading in/out, and much more. See [their documentation](https://github.com/goldfire/howler.js/#properties) for the complete list.

## Usage

Once your store is created, dispatching actions that trigger sounds is simple.

Using the convention established in the [rafScheduler Middleware example](https://github.com/reactjs/redux/blob/master/docs/advanced/Middleware.md#seven-examples), a new `meta` property can be attached to actions. This `meta` property should have a `sound` key, and its value should be that of a registered sound.

Continuing from our example above, we have 5 possible sounds: `endTurn`, `winGame`, and 3 flavors of jumps.

The Howler methods other than `play` follow almost the same API as Howler:

**Howler**

```javascript
sound.fade(1, 0, 1000, id);
sound.stop(id);
```

**redux-sounds action**

```javascript
// fade
meta: {
  sound: {
    fade: ['endTurn', 1, 0, 1000];
  }
}

// stop
meta: {
  sound: {
    stop: 'endTurn';
  }
}
```

For sprites, separate the sound name from the sprite name with a period (`.`). A couple examples of the actions we can dispatch:

```javascript
/* game-actions.js */

export function endTurn() {
  return {
    type: 'END_TURN',
    meta: {
      sound: {
        play: 'endTurn'
      }
    }
  };
}

export function lowJump() {
  return {
    type: 'LOW_JUMP',
    meta: {
      sound: {
        play: 'jumps.lowJump'
      }
    }
  };
}

export function lowJumpStop() {
  return {
    type: 'LOW_JUMP_STOP',
    meta: {
      sound: {
        stop: 'jumps.lowJump'
      }
    }
  };
}

export function lowJumpFade() {
  return {
    type: 'LOW_JUMP_STOP',
    meta: {
      sound: {
        fade: ['jumps.lowJump', 0, 1, 2]
      }
    }
  };
}
```

_**Note:** It is worth noting that it is unlikely that you'll need to create new actions for your sound effects; You'll probably want to just add `meta` properties to pre-existing actions, so that they play a sound in addition to whatever else they do (change the reducer state, trigger other middleware, etc)._  
_**Also Note:** When a sound is playing multiple times at once, Howler methods (stop, fade, pause, etc.) will apply to **all** playing instances_

### Adding more sounds via actions

```javascript
/* add-sounds-actions.js */
const coinSoundsData = {
  heavyCoin: 'https://s3.amazonaws.com/bucketName/gold_coin.mp3',
  lightCoin: {
    src: 'https://s3.amazonaws.com/bucketName/gold_coin.mp3', // just lower volume
    volume: 0.75
  },
  randomCoins: {
    src: ['https://s3.amazonaws.com/bucketName/coin_collection.mp3'],
    sprite: {
      one: [0, 1000],
      two: [1000, 2500],
      three: [3500, 10000]
    }
  }
};

export function addCoinSounds() {
  return {
    type: 'ADD_COIN_SOUNDS',
    meta: {
      sound: {
        add: coinSoundsData
      }
    }
  };
}
```
### Callbacks
The Howler callbacks `onplay`, `onstop`, and `onend` are currently supported

```javascript
const winPopup = {
  type: 'SHOW_WIN_POPUP',
  payload: 'You won'
}

const soundsData = {
  randomCoins: {
    src: ['https://s3.amazonaws.com/bucketName/coin_collection.mp3'],
    sprite: {
      one: [0, 1000],
      two: [1000, 2500],
      three: [3500, 10000]
    },
    onend: (id, dispatch) => dispatch(winPopup)
  }
};
```

### Playlist
It is preferable to have your playlist merged as one continuous sounds. If that's not possible, you can 
dispatch a "playlist" action like the example below.

```javascript
/* playlist-action.js */
export function playlistSounds() {
  return {
    type: 'PLAYLIST_SOUNDS',
    meta: {
      sound: {
        list: [
          { play: 'jumps.lowJump' },
          { play: 'jumps.longJump' },
          { play: 'endTurn' }
        ]
      }
    }
  };
}
```

## Troubleshooting

#### Unregistered sound

When you dispatch an action with a `meta.sound` property, redux-sounds looks for a registered sound under that name. If it cannot find one, you'll get a console warning:

    The sound 'foo' was requested, but redux-sounds doesn't have anything registered under that name.

To understand why this is happening, let's examine the link between registering a sound when the store is created, and triggering a sound when an action is dispatched.

When you create your store, you pass in an object like so:

```javascript
const soundsData = {
  foo: 'path/to/foo.mp3'
};
```

The keys in that object must correspond to the value specified when you dispatch your action:

```javascript
dispatch({
  type: 'ACTION_NAME',
  meta: {
    sound: { play: 'foo' }
  }
});
```

Make sure these two values are the same!

#### Invalid sprite

When your `meta.sound` value has a period in it (eg. `foo.bar`), redux-sounds breaks it apart so that the first half is the sound name, and the second half is the sprite name.

If redux-sounds has a sound registered under 'foo', but that sound has no specified sprite for 'bar', you get a console warning that resembles:

    The sound 'foo' was found, but it does not have a sprite specified for 'bar'.

It is possible that there is a typo, either in the `meta.sound` property or the sprite data passed in on initialization.

#### A `missingSoundData` error throws when I try loading the page.

Unlike other middleware, you cannot simply pass it to Redux as-is:

```javascript
import soundsMiddleware from 'redux-sounds';

// DON'T do this:
const store = createStore(rootReducer, applyMiddleware(soundsMiddleware));
```

The reason for this is that before the store can be registered, you need to pass it data about which sounds it needs to handle.

You must first invoke `soundsMiddleware` with a `soundsData` object:

```javascript
import soundsMiddleware from 'redux-sounds';
import { soundsData } from '../data/sounds';

// Important step:
const loadedSoundsMiddleware = soundsMiddleware(soundsData);

const store = createStore(rootReducer, applyMiddleware(loadedSoundsMiddleware));
```

## Tests

To run: `npm run test`

Using Mocha for test-running, Chai Expect for assertions, and Istanbul for test coverage.

While test coverage is high, because the tests run in Node, and Node has no ability to play sounds, the actual output is not tested.

Because I've delegated these duties to Howler, though, I don't feel too bad about that. I check to make sure the right info is passed to Howler at the right time; Howler's tests can take it from there.

## Planned functionality

Got ideas for must-have functionality? Create an issue and let's discuss =)

## Contributions

Contributors welcome! Please discuss additional features with me before implementing them, and please supply tests along with any bug fixes.

## License

[MIT](https://github.com/joshwcomeau/redux-sounds/blob/master/LICENSE.md)
