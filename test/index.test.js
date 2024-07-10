/* eslint-disable import/no-extraneous-dependencies */
// Test suite coverage
// Sadly, Howler.js will not try to load or play any sounds when there is
// no audio environment available. Node has no audio environment.
// We'll test the middleware instantiation, how it handles actions, whether
// it hands the right data to Howler, and some other configuration stuff.
import {
  afterAll, afterEach, beforeAll, describe, expect, it, jest
} from '@jest/globals';
import { Howl } from 'howler';
import isObjectWithValues from '../src/utils';

let howlerIntegration;
let soundMiddleware;
await jest.isolateModulesAsync(async () => {
  howlerIntegration = (await import('../src/howler_integration')).default;
  soundMiddleware = (await import('../src')).default;
});

const warnStub = jest.spyOn(console, 'warn');

const soundsData = {
  endTurn: 'path/to/sound.mp3',
  winGame: {
    src: ['path/to/other_sound.mp3'],
    volume: 0.75
  },
  allSounds: {
    src: ['sound1.mp3'],
    sprite: {
      boom: [0, 1000],
      bang: [1500, 2000],
      crash: [2000, 2345]
    }
  }
};

// TODO: TEST ADDING SOUNDS TO EMPTY INTEGRATION

const addedSoundsData = {
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

const moreAddedSoundsData = {
  heavierCoin: 'https://s3.amazonaws.com/bucketName/uranium_coin.mp3',
  lighterCoin: {
    src: 'https://s3.amazonaws.com/bucketName/magnesium_coin.mp3',
    volume: 0.75
  },
  radCoins: {
    src: ['https://s3.amazonaws.com/bucketName/rad_coin_collection.mp3'],
    sprite: {
      one: [0, 1000],
      two: [1000, 2500],
      three: [3500, 10000]
    }
  }
};

describe('utils', () => {
  const truthy = [{ hello: 'world' }];
  const falsy = [
    undefined,
    null,
    false,
    true,
    '',
    'test',
    234,
    new Date(),
    {},
    Object.create(null)
  ];

  describe('#isObjectWithValues', () => {
    it('returns falsy for an empty Object or non-object', () => {
      falsy.forEach((obj) => {
        expect(!!isObjectWithValues(obj)).toBe(false);
      });
    });
    it('returns truthy for an empty Object', () => {
      truthy.forEach((obj) => {
        expect(!!isObjectWithValues(obj)).toBe(true);
      });
    });
  });
});

describe('howlerIntegration', () => {
  const sounds = howlerIntegration.initialize(soundsData);
  const { playing } = howlerIntegration;
  const playingNames = Object.keys(playing);
  const playingValues = playingNames.map((name) => playing[name]);
  const soundNames = Object.keys(sounds);
  const soundValues = soundNames.map((name) => sounds[name]);

  let actual;
  let expected;

  describe('#initialize', () => {
    it('contains keys for each sound name', () => {
      expected = ['endTurn', 'winGame', 'allSounds'];
      actual = soundNames;

      expect(expected).toEqual(actual);
    });

    it('contains a hashmap with all possible playing names', () => {
      expected = [
        'endTurn',
        'winGame',
        'allSoundsboom',
        'allSoundsbang',
        'allSoundscrash'
      ];
      actual = playingNames;

      expect(expected).toEqual(actual);
    });

    it('contains Howler instances for each sound value', () => {
      soundValues.forEach((sound) => {
        expect(sound).toHaveProperty('_drain');
      });
    });

    it('contains Set instances for each possible playing name', () => {
      playingValues.forEach((ids) => {
        expect(ids).toBeInstanceOf(Set);
      });
    });

    it('set up the URL for endTurn (string-based)', () => {
      expected = ['path/to/sound.mp3'];
      actual = sounds.endTurn._src;

      expect(expected).toEqual(actual);
    });

    it('set up the URL for winGame (property-based)', () => {
      expected = ['path/to/other_sound.mp3'];
      actual = sounds.winGame._src;

      expect(expected).toEqual(actual);
    });

    it('set up the volume for winGame (property-based)', () => {
      expected = 0.75;
      actual = sounds.winGame._volume;

      expect(expected).toEqual(actual);
    });

    it('set up the sprites for allSounds', () => {
      expected = { boom: [0, 1000], bang: [1500, 2000], crash: [2000, 2345] };
      actual = sounds.allSounds._sprite;

      expect(expected).toEqual(actual);
    });

    it('offers a "play" method for triggering sounds', () => {
      soundValues.forEach((sound) => {
        expect(sound.play).toEqual(expect.any(Function));
      });
    });

    it('offers a "fade" method for setting a sound or sprite\'s volume', () => {
      soundValues.forEach((sound) => {
        expect(sound.fade).toEqual(expect.any(Function));
      });
    });

    it('has a method for deleting a sound id', () => {
      const id = howlerIntegration.play('allSounds', 'boom');
      expect(playingValues[2].has(id)).toBe(true);
      howlerIntegration.removeId(id);
      expect(playingValues[2].has(id)).toBe(false);
    });
  });
});

describe('soundMiddleware', () => {
  const next = jest.fn();

  let storeHandler;
  let nextHandler;
  let actionHandler;

  afterEach(() => {
    // reset our spies and stubs
    warnStub.mockClear();
    next.mockClear();
  });

  describe('initialization', () => {
    it('can be initialized without sounds', () => {
      expect(soundMiddleware).not.toThrow();
    });
  });

  describe('curried application', () => {
    it('loads the middleware with sounds data, returns a function', () => {
      storeHandler = soundMiddleware(soundsData);
      expect(storeHandler).toEqual(expect.any(Function));
    });

    it('loads the store, and returns a function', () => {
      // We don't use the store in my middleware at all.
      // Pass in an empty object, just to match the real-world input type.
      nextHandler = storeHandler({});
      expect(nextHandler).toEqual(expect.any(Function));
    });

    it('loads next, and returns a function', () => {
      actionHandler = nextHandler(next);
      expect(actionHandler).toEqual(expect.any(Function));
    });
  });

  describe('dispatching actions', () => {
    it('console.warns when the sound is not found when trying to play', () => {
      const action = {
        name: 'LOSE_GAME',
        meta: { sound: { play: 'loseGame' } }
      };
      actionHandler(action);

      expect(warnStub).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('console.warns when the sound is not found when trying to stop', () => {
      const action = {
        name: 'LOSE_GAME',
        meta: { sound: { stop: 'loseGame' } }
      };
      actionHandler(action);

      expect(warnStub).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('console.warns when the sound is found, but not the sprite', () => {
      const action = {
        name: 'CLANG',
        meta: { sound: { play: 'allSounds.clang' } }
      };
      actionHandler(action);

      expect(warnStub).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('forwards actions with no meta.sound', () => {
      const action = { name: 'UNRELATED_ACTION' };
      actionHandler(action);

      expect(warnStub).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('forwards actions with meta.sound', () => {
      const action = { name: 'WIN_GAME', meta: { sound: { play: 'winGame' } } };
      actionHandler(action);

      expect(warnStub).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('howlerIntegration handoff', () => {
    let playSpy;
    let addSpy;
    let endTurnSpy;
    let winGameSpy;
    let allSoundsSpy;
    let proxySpy;
    let endTurnStopSpy;
    let winGameStopSpy;
    let allSoundsStopSpy;
    let endTurnFadeSpy;
    let winGameFadeSpy;
    let allSoundsFadeSpy;

    beforeAll(() => {
      playSpy = jest.spyOn(howlerIntegration, 'play');
      addSpy = jest.spyOn(howlerIntegration, 'add');
      endTurnSpy = jest.spyOn(howlerIntegration.sounds.endTurn, 'play');
      winGameSpy = jest.spyOn(howlerIntegration.sounds.winGame, 'play');
      allSoundsSpy = jest.spyOn(howlerIntegration.sounds.allSounds, 'play');
      proxySpy = jest.spyOn(howlerIntegration, 'proxy');
      endTurnStopSpy = jest.spyOn(howlerIntegration.sounds.endTurn, 'stop');
      winGameStopSpy = jest.spyOn(howlerIntegration.sounds.winGame, 'stop');
      allSoundsStopSpy = jest.spyOn(howlerIntegration.sounds.allSounds, 'stop');
      endTurnFadeSpy = jest.spyOn(howlerIntegration.sounds.endTurn, 'fade');
      winGameFadeSpy = jest.spyOn(howlerIntegration.sounds.winGame, 'fade');
      allSoundsFadeSpy = jest.spyOn(howlerIntegration.sounds.allSounds, 'fade');
    });
    afterEach(() => {
      playSpy.mockClear();
      addSpy.mockClear();
      endTurnSpy.mockClear();
      winGameSpy.mockClear();
      allSoundsSpy.mockClear();
      proxySpy.mockClear();
      endTurnStopSpy.mockClear();
      winGameStopSpy.mockClear();
      allSoundsStopSpy.mockClear();
      endTurnFadeSpy.mockClear();
      winGameFadeSpy.mockClear();
      allSoundsFadeSpy.mockClear();
    });
    afterAll(() => {
      playSpy.mockReset();
      addSpy.mockReset();
      endTurnSpy.mockReset();
      winGameSpy.mockReset();
      allSoundsSpy.mockReset();
      proxySpy.mockReset();
      endTurnStopSpy.mockReset();
      winGameStopSpy.mockReset();
      allSoundsStopSpy.mockReset();
      endTurnFadeSpy.mockReset();
      winGameFadeSpy.mockReset();
      allSoundsFadeSpy.mockReset();
    });
    describe('adds sounds', () => {
      it('calls to add the sounds to the Howler integration', () => {
        const action = {
          type: 'ADD_COIN_SOUNDS',
          meta: {
            sound: {
              add: addedSoundsData
            }
          }
        };
        actionHandler(action);

        expect(addSpy).toHaveBeenCalledTimes(1);
      });

      it('contains a hashmap which includes the additional playing names', () => {
        const action = {
          type: 'ADD_COIN_SOUNDS',
          meta: {
            sound: {
              add: addedSoundsData
            }
          }
        };
        actionHandler(action);

        const playingNames = Object.keys(howlerIntegration.playing);
        const expected = [
          'endTurn',
          'winGame',
          'allSoundsboom',
          'allSoundsbang',
          'allSoundscrash',
          'heavyCoin',
          'lightCoin',
          'randomCoinsone',
          'randomCoinstwo',
          'randomCoinsthree'
        ];
        expect(addSpy).toHaveBeenCalledTimes(1);
        expect(expected).toEqual(playingNames);
      });

      it('can add sounds dynamically multiple times', () => {
        const action = {
          type: 'ADD_COIN_SOUNDS',
          meta: {
            sound: {
              add: addedSoundsData
            }
          }
        };
        const action2 = {
          type: 'ADD_COIN_SOUNDS_1',
          meta: {
            sound: {
              add: moreAddedSoundsData
            }
          }
        };
        actionHandler(action);
        actionHandler(action2);

        const playingNames = Object.keys(howlerIntegration.playing);
        const soundNames = Object.keys(howlerIntegration.sounds);
        const expectedPlaying = [
          'endTurn',
          'winGame',
          'allSoundsboom',
          'allSoundsbang',
          'allSoundscrash',
          'heavyCoin',
          'lightCoin',
          'randomCoinsone',
          'randomCoinstwo',
          'randomCoinsthree',
          'heavierCoin',
          'lighterCoin',
          'radCoinsone',
          'radCoinstwo',
          'radCoinsthree'
        ];
        const expectedSounds = [
          'endTurn',
          'winGame',
          'allSounds',
          'heavyCoin',
          'lightCoin',
          'randomCoins',
          'heavierCoin',
          'lighterCoin',
          'radCoins'
        ];
        expect(addSpy).toHaveBeenCalledTimes(2);
        expect(expectedPlaying).toEqual(playingNames);
        expect(expectedSounds).toEqual(soundNames);
      });
    });

    it('invokes .play with endTurn', () => {
      const action = { name: 'END_TURN', meta: { sound: { play: 'endTurn' } } };
      actionHandler(action);

      expect(playSpy).toHaveBeenCalledTimes(1);
      expect(playSpy).toHaveBeenCalledWith('endTurn', undefined);
      expect(endTurnSpy).toHaveBeenCalledTimes(1);
      expect(endTurnSpy).toHaveBeenCalledWith(undefined);
    });

    it('invokes .stop with endTurn', () => {
      const action = { name: 'END_TURN', meta: { sound: { stop: 'endTurn' } } };
      actionHandler(action);

      expect(proxySpy).toHaveBeenCalledTimes(1);
      expect(proxySpy).toHaveBeenCalledWith('endTurn', undefined, 'stop');
      expect(endTurnStopSpy).toHaveBeenCalledTimes(
        howlerIntegration.playing.endTurn.size
      );
      expect(endTurnStopSpy).toHaveBeenCalledWith(
        howlerIntegration.playing.endTurn.values().next().value
      );
    });

    it('invokes .fade with endTurn', () => {
      const action = {
        name: 'END_TURN',
        meta: { sound: { fade: ['endTurn', 0, 1, 2] } }
      };
      actionHandler(action);

      expect(proxySpy).toHaveBeenCalledTimes(1);
      expect(proxySpy).toHaveBeenCalledWith(
        'endTurn',
        undefined,
        'fade',
        0,
        1,
        2
      );
      expect(endTurnFadeSpy).toHaveBeenCalledTimes(
        howlerIntegration.playing.endTurn.size
      );
      expect(endTurnFadeSpy).toHaveBeenCalledWith(
        0,
        1,
        2,
        howlerIntegration.playing.endTurn.values().next().value
      );
    });

    it('invokes .play with winGame', () => {
      const action = { name: 'WIN_GAME', meta: { sound: { play: 'winGame' } } };
      actionHandler(action);

      expect(playSpy).toHaveBeenCalledTimes(1);
      expect(playSpy).toHaveBeenCalledWith('winGame', undefined);
      expect(winGameSpy).toHaveBeenCalledTimes(1);
      expect(winGameSpy).toHaveBeenCalledWith(undefined);
    });

    it('invokes .stop with winGame', () => {
      const action = { name: 'WIN_GAME', meta: { sound: { stop: 'winGame' } } };
      actionHandler(action);

      expect(proxySpy).toHaveBeenCalledTimes(1);
      expect(proxySpy).toHaveBeenCalledWith('winGame', undefined, 'stop');
      expect(winGameStopSpy).toHaveBeenCalledTimes(
        howlerIntegration.playing.winGame.size
      );
      expect(winGameStopSpy).toHaveBeenCalledWith(
        howlerIntegration.playing.winGame.values().next().value
      );
    });

    it('invokes .fade with winGame', () => {
      const action = {
        name: 'END_TURN',
        meta: { sound: { fade: ['winGame', 0, 1, 2] } }
      };
      actionHandler(action);

      expect(proxySpy).toHaveBeenCalledTimes(1);
      expect(proxySpy).toHaveBeenCalledWith(
        'winGame',
        undefined,
        'fade',
        0,
        1,
        2
      );
      expect(winGameFadeSpy).toHaveBeenCalledTimes(
        howlerIntegration.playing.winGame.size
      );
      expect(winGameFadeSpy).toHaveBeenCalledWith(
        0,
        1,
        2,
        howlerIntegration.playing.winGame.values().next().value
      );
    });

    it('invokes .play with allSounds (with spriteName)', () => {
      const action = {
        name: 'BOOM',
        meta: { sound: { play: 'allSounds.boom' } }
      };
      actionHandler(action);

      expect(playSpy).toHaveBeenCalledTimes(1);
      expect(playSpy).toHaveBeenCalledWith('allSounds', 'boom');
      expect(allSoundsSpy).toHaveBeenCalledTimes(1);
      expect(allSoundsSpy).toHaveBeenCalledWith('boom');
    });

    it('invokes .stop with allSounds (with spriteName)', () => {
      const action = {
        name: 'WIN_GAME',
        meta: { sound: { stop: 'allSounds.boom' } }
      };
      actionHandler(action);

      expect(proxySpy).toHaveBeenCalledTimes(1);
      expect(proxySpy).toHaveBeenCalledWith('allSounds', 'boom', 'stop');
      expect(allSoundsStopSpy).toHaveBeenCalledTimes(
        howlerIntegration.playing.allSoundsboom.size
      );
      expect(allSoundsStopSpy).toHaveBeenCalledWith(
        howlerIntegration.playing.allSoundsboom.values().next().value
      );
    });

    it('invokes .fade with allSounds (with spriteName)', () => {
      const action = {
        name: 'END_TURN',
        meta: { sound: { fade: ['allSounds.boom', 0, 1, 2] } }
      };
      actionHandler(action);

      expect(proxySpy).toHaveBeenCalledTimes(1);
      expect(proxySpy).toHaveBeenCalledWith(
        'allSounds',
        'boom',
        'fade',
        0,
        1,
        2
      );
      expect(allSoundsFadeSpy).toHaveBeenCalledTimes(
        howlerIntegration.playing.allSoundsboom.size
      );
      expect(allSoundsFadeSpy).toHaveBeenCalledWith(
        0,
        1,
        2,
        howlerIntegration.playing.allSoundsboom.values().next().value
      );
    });
  });
});

let howlerIntegration2;
let soundMiddleware2;
await jest.isolateModulesAsync(async () => {
  howlerIntegration2 = (await import('../src/howler_integration')).default;
  soundMiddleware2 = (await import('../src')).default;
});

describe('howler integration without sound data', () => {
  const next = jest.fn();
  const storeHandler = soundMiddleware2();
  it('has store handler', () => {
    expect(storeHandler).toEqual(expect.any(Function));
    warnStub.mockRestore();
    next.mockRestore();
  });

  const nextHandler = storeHandler({});
  it('has next handler', () => {
    expect(nextHandler).toEqual(expect.any(Function));
    warnStub.mockRestore();
    next.mockRestore();
  });

  const actionHandler = nextHandler(next);
  const addAction = {
    type: 'ADD_COIN_SOUNDS',
    meta: {
      sound: {
        add: addedSoundsData
      }
    }
  };
  actionHandler(addAction);

  describe('howler integration without initial sound data hand-off', () => {
    let playSpy;
    let addSpy;
    let heavyCoinSpy;

    beforeAll(() => {
      playSpy = jest.spyOn(howlerIntegration2, 'play');
      addSpy = jest.spyOn(howlerIntegration2, 'add');
    });
    afterEach(() => {
      playSpy.mockClear();
      addSpy.mockClear();
    });
    afterAll(() => {
      playSpy.mockRestore();
      addSpy.mockRestore();
    });

    describe('adds sounds', () => {
      it('contains a hashmap which includes only the additional dynamic playing names', () => {
        actionHandler(addAction);
        const playingNames = Object.keys(howlerIntegration2.playing);
        const expected = [
          'heavyCoin',
          'lightCoin',
          'randomCoinsone',
          'randomCoinstwo',
          'randomCoinsthree'
        ];
        expect(addSpy).toHaveBeenCalledTimes(1);
        expect(expected).toEqual(playingNames);
      });
    });

    it('invokes .play with heavyCoin', () => {
      heavyCoinSpy = jest.spyOn(howlerIntegration2.sounds.heavyCoin, 'play');

      const heavyAction = {
        name: 'HEAVY_COIN',
        meta: { sound: { play: 'heavyCoin' } }
      };
      actionHandler(heavyAction);

      expect(playSpy).toHaveBeenCalledTimes(1);
      expect(playSpy).toHaveBeenCalledWith('heavyCoin', undefined);
      expect(heavyCoinSpy).toHaveBeenCalledTimes(1);
      expect(heavyCoinSpy).toHaveBeenCalledWith(undefined);
    });
  });
});
