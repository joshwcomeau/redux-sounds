// Test suite coverage
// Sadly, Howler.js will not try to load or play any sounds when there is
// no audio environment available. Node has no audio environment.
// We'll test the middleware instantiation, how it handles actions, whether
// it hands the right data to Howler, and some other configuration stuff.
//
import chai, { expect } from 'chai';
import { Howl } from 'howler';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import importFresh from 'import-fresh';

import soundMiddleware from '../src/index';

const howlerIntegration = require('../src/howler_integration');
const { isObjectWithValues } = require('../src/utils');

const howlerIntegration2 = importFresh('../src/howler_integration');
const soundMiddleware2 = importFresh('../src/index');

chai.use(sinonChai);
const warnStub = sinon.stub(console, 'warn');
const logStub = sinon.stub(console, 'log');

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
        expect(!!isObjectWithValues(obj)).to.equal(false);
      });
    });
    it('returns truthy for an empty Object', () => {
      truthy.forEach((obj) => {
        expect(!!isObjectWithValues(obj)).to.equal(true);
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

      expect(expected).to.deep.equal(actual);
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

      expect(expected).to.deep.equal(actual);
    });

    it('contains Howler instances for each sound value', () => {
      soundValues.forEach((sound) => {
        expect(sound).to.be.an.instanceof(Howl);
      });
    });

    it('contains Set instances for each possible playing name', () => {
      playingValues.forEach((ids) => {
        expect(ids).to.be.an.instanceof(Set);
      });
    });

    it('set up the URL for endTurn (string-based)', () => {
      expected = ['path/to/sound.mp3'];
      actual = sounds.endTurn._src;

      expect(expected).to.deep.equal(actual);
    });

    it('set up the URL for winGame (property-based)', () => {
      expected = ['path/to/other_sound.mp3'];
      actual = sounds.winGame._src;

      expect(expected).to.deep.equal(actual);
    });

    it('set up the volume for winGame (property-based)', () => {
      expected = 0.75;
      actual = sounds.winGame._volume;

      expect(expected).to.deep.equal(actual);
    });

    it('set up the sprites for allSounds', () => {
      expected = { boom: [0, 1000], bang: [1500, 2000], crash: [2000, 2345] };
      actual = sounds.allSounds._sprite;

      expect(expected).to.deep.equal(actual);
    });

    it('offers a "play" method for triggering sounds', () => {
      soundValues.forEach((sound) => {
        expect(sound.play).to.be.a('function');
      });
    });

    it('offers a "fade" method for setting a sound or sprite\'s volume', () => {
      soundValues.forEach((sound) => {
        expect(sound.fade).to.be.a('function');
      });
    });

    it('has a method for deleting a sound id', () => {
      const id = howlerIntegration.play('allSounds', 'boom');
      expect(playingValues[2].has(id)).to.equal(true);
      howlerIntegration.removeId(id);
      expect(playingValues[2].has(id)).to.equal(false);
    });
  });
});

describe('soundMiddleware', () => {
  const next = sinon.spy();

  let storeHandler;
  let nextHandler;
  let actionHandler;

  afterEach(() => {
    // reset our spies and stubs
    warnStub.resetHistory();
    next.resetHistory();
  });

  describe('initialization', () => {
    it('can be initialized without sounds', () => {
      expect(soundMiddleware).not.to.throw();
    });
  });

  describe('curried application', () => {
    it('loads the middleware with sounds data, returns a function', () => {
      storeHandler = soundMiddleware(soundsData);
      expect(storeHandler).to.be.a('function');
    });

    it('loads the store, and returns a function', () => {
      // We don't use the store in my middleware at all.
      // Pass in an empty object, just to match the real-world input type.
      nextHandler = storeHandler({});
      expect(nextHandler).to.be.a('function');
    });

    it('loads next, and returns a function', () => {
      actionHandler = nextHandler(next);
      expect(actionHandler).to.be.a('function');
    });
  });

  describe('dispatching actions', () => {
    it('console.warns when the sound is not found when trying to play', () => {
      const action = {
        name: 'LOSE_GAME',
        meta: { sound: { play: 'loseGame' } }
      };
      actionHandler(action);

      expect(warnStub).to.have.been.calledOnce;
      expect(next).to.have.been.calledOnce;
    });

    it('console.warns when the sound is not found when trying to stop', () => {
      const action = {
        name: 'LOSE_GAME',
        meta: { sound: { stop: 'loseGame' } }
      };
      actionHandler(action);

      expect(warnStub).to.have.been.calledOnce;
      expect(next).to.have.been.calledOnce;
    });

    it('console.warns when the sound is found, but not the sprite', () => {
      const action = {
        name: 'CLANG',
        meta: { sound: { play: 'allSounds.clang' } }
      };
      actionHandler(action);

      expect(warnStub).to.have.been.calledOnce;
      expect(next).to.have.been.calledOnce;
    });

    it('forwards actions with no meta.sound', () => {
      const action = { name: 'UNRELATED_ACTION' };
      actionHandler(action);

      expect(warnStub).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it('forwards actions with meta.sound', () => {
      const action = { name: 'WIN_GAME', meta: { sound: { play: 'winGame' } } };
      actionHandler(action);

      expect(warnStub).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
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

    before(() => {
      playSpy = sinon.spy(howlerIntegration, 'play');
      addSpy = sinon.spy(howlerIntegration, 'add');
      endTurnSpy = sinon.spy(howlerIntegration.sounds.endTurn, 'play');
      winGameSpy = sinon.spy(howlerIntegration.sounds.winGame, 'play');
      allSoundsSpy = sinon.spy(howlerIntegration.sounds.allSounds, 'play');
      proxySpy = sinon.spy(howlerIntegration, 'proxy');
      endTurnStopSpy = sinon.spy(howlerIntegration.sounds.endTurn, 'stop');
      winGameStopSpy = sinon.spy(howlerIntegration.sounds.winGame, 'stop');
      allSoundsStopSpy = sinon.spy(howlerIntegration.sounds.allSounds, 'stop');
      endTurnFadeSpy = sinon.spy(howlerIntegration.sounds.endTurn, 'fade');
      winGameFadeSpy = sinon.spy(howlerIntegration.sounds.winGame, 'fade');
      allSoundsFadeSpy = sinon.spy(howlerIntegration.sounds.allSounds, 'fade');
    });
    afterEach(() => {
      playSpy.resetHistory();
      addSpy.resetHistory();
      endTurnSpy.resetHistory();
      winGameSpy.resetHistory();
      allSoundsSpy.resetHistory();
      proxySpy.resetHistory();
      endTurnStopSpy.resetHistory();
      winGameStopSpy.resetHistory();
      allSoundsStopSpy.resetHistory();
      endTurnFadeSpy.resetHistory();
      winGameFadeSpy.resetHistory();
      allSoundsFadeSpy.resetHistory();
    });
    after(() => {
      playSpy.restore();
      addSpy.restore();
      endTurnSpy.restore();
      winGameSpy.restore();
      allSoundsSpy.restore();
      proxySpy.restore();
      endTurnStopSpy.restore();
      winGameStopSpy.restore();
      allSoundsStopSpy.restore();
      endTurnFadeSpy.restore();
      winGameFadeSpy.restore();
      allSoundsFadeSpy.restore();
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

        expect(addSpy).to.have.been.calledOnce;
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
        expect(addSpy).to.have.been.calledOnce;
        expect(expected).to.deep.equal(playingNames);
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
        expect(addSpy).to.have.been.calledTwice;
        expect(expectedPlaying).to.deep.equal(playingNames);
        expect(expectedSounds).to.deep.equal(soundNames);
      });
    });

    it('invokes .play with endTurn', () => {
      const action = { name: 'END_TURN', meta: { sound: { play: 'endTurn' } } };
      actionHandler(action);

      expect(playSpy).to.have.been.calledOnce;
      expect(playSpy).to.have.been.calledWithExactly('endTurn', undefined);
      expect(endTurnSpy).to.have.been.calledOnce;
      expect(endTurnSpy).to.have.been.calledWithExactly(undefined);
    });

    it('invokes .stop with endTurn', () => {
      const action = { name: 'END_TURN', meta: { sound: { stop: 'endTurn' } } };
      actionHandler(action);

      expect(proxySpy).to.have.been.calledOnce;
      expect(proxySpy).to.have.been.calledWithExactly(
        'endTurn',
        undefined,
        'stop'
      );
      expect(endTurnStopSpy).to.have.callCount(
        howlerIntegration.playing.endTurn.size
      );
      expect(endTurnStopSpy).to.have.been.calledWithExactly(
        howlerIntegration.playing.endTurn.values().next().value
      );
    });

    it('invokes .fade with endTurn', () => {
      const action = {
        name: 'END_TURN',
        meta: { sound: { fade: ['endTurn', 0, 1, 2] } }
      };
      actionHandler(action);

      expect(proxySpy).to.have.been.calledOnce;
      expect(proxySpy).to.have.been.calledWithExactly(
        'endTurn',
        undefined,
        'fade',
        0,
        1,
        2
      );
      expect(endTurnFadeSpy).to.have.callCount(
        howlerIntegration.playing.endTurn.size
      );
      expect(endTurnFadeSpy).to.have.been.calledWithExactly(
        0,
        1,
        2,
        howlerIntegration.playing.endTurn.values().next().value
      );
    });

    it('invokes .play with winGame', () => {
      const action = { name: 'WIN_GAME', meta: { sound: { play: 'winGame' } } };
      actionHandler(action);

      expect(playSpy).to.have.been.calledOnce;
      expect(playSpy).to.have.been.calledWithExactly('winGame', undefined);
      expect(winGameSpy).to.have.been.calledOnce;
      expect(winGameSpy).to.have.been.calledWithExactly(undefined);
    });

    it('invokes .stop with winGame', () => {
      const action = { name: 'WIN_GAME', meta: { sound: { stop: 'winGame' } } };
      actionHandler(action);

      expect(proxySpy).to.have.been.calledOnce;
      expect(proxySpy).to.have.been.calledWithExactly(
        'winGame',
        undefined,
        'stop'
      );
      expect(winGameStopSpy).to.have.callCount(
        howlerIntegration.playing.winGame.size
      );
      expect(winGameStopSpy).to.have.been.calledWithExactly(
        howlerIntegration.playing.winGame.values().next().value
      );
    });

    it('invokes .fade with winGame', () => {
      const action = {
        name: 'END_TURN',
        meta: { sound: { fade: ['winGame', 0, 1, 2] } }
      };
      actionHandler(action);

      expect(proxySpy).to.have.been.calledOnce;
      expect(proxySpy).to.have.been.calledWithExactly(
        'winGame',
        undefined,
        'fade',
        0,
        1,
        2
      );
      expect(winGameFadeSpy).to.have.callCount(
        howlerIntegration.playing.winGame.size
      );
      expect(winGameFadeSpy).to.have.been.calledWithExactly(
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

      expect(playSpy).to.have.been.calledOnce;
      expect(playSpy).to.have.been.calledWithExactly('allSounds', 'boom');
      expect(allSoundsSpy).to.have.been.calledOnce;
      expect(allSoundsSpy).to.have.been.calledWithExactly('boom');
    });

    it('invokes .stop with allSounds (with spriteName)', () => {
      const action = {
        name: 'WIN_GAME',
        meta: { sound: { stop: 'allSounds.boom' } }
      };
      actionHandler(action);

      expect(proxySpy).to.have.been.calledOnce;
      expect(proxySpy).to.have.been.calledWithExactly(
        'allSounds',
        'boom',
        'stop'
      );
      expect(allSoundsStopSpy).to.have.callCount(
        howlerIntegration.playing.allSoundsboom.size
      );
      expect(allSoundsStopSpy).to.have.been.calledWithExactly(
        howlerIntegration.playing.allSoundsboom.values().next().value
      );
    });

    it('invokes .fade with allSounds (with spriteName)', () => {
      const action = {
        name: 'END_TURN',
        meta: { sound: { fade: ['allSounds.boom', 0, 1, 2] } }
      };
      actionHandler(action);

      expect(proxySpy).to.have.been.calledOnce;
      expect(proxySpy).to.have.been.calledWithExactly(
        'allSounds',
        'boom',
        'fade',
        0,
        1,
        2
      );
      expect(allSoundsFadeSpy).to.have.callCount(
        howlerIntegration.playing.allSoundsboom.size
      );
      expect(allSoundsFadeSpy).to.have.been.calledWithExactly(
        0,
        1,
        2,
        howlerIntegration.playing.allSoundsboom.values().next().value
      );
    });
  });
});

describe('howler integration without sound data', () => {
  const next = sinon.spy();
  afterEach(() => {
    // reset our spies and stubs
    warnStub.resetHistory();
    next.resetHistory();
  });

  const storeHandler = soundMiddleware2();
  expect(storeHandler).to.be.a('function');

  const nextHandler = storeHandler({});
  expect(nextHandler).to.be.a('function');

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
    let lightCoinSpy;
    let randomCoinsSpy;
    let proxySpy;
    let heavyCoinStopSpy;
    let lightCoinStopSpy;
    let randomCoinsStopSpy;
    let heavyCoinFadeSpy;
    let lightCoinFadeSpy;
    let randomCoinsFadeSpy;

    before(() => {
      playSpy = sinon.spy(howlerIntegration2, 'play');
      addSpy = sinon.spy(howlerIntegration2, 'add');
      heavyCoinSpy = sinon.spy(howlerIntegration2.sounds.heavyCoin, 'play');
      lightCoinSpy = sinon.spy(howlerIntegration2.sounds.lightCoin, 'play');
      randomCoinsSpy = sinon.spy(howlerIntegration2.sounds.randomCoins, 'play');
      proxySpy = sinon.spy(howlerIntegration2, 'proxy');
      heavyCoinStopSpy = sinon.spy(howlerIntegration2.sounds.heavyCoin, 'stop');
      lightCoinStopSpy = sinon.spy(howlerIntegration2.sounds.lightCoin, 'stop');
      randomCoinsStopSpy = sinon.spy(
        howlerIntegration2.sounds.randomCoins,
        'stop'
      );
      heavyCoinFadeSpy = sinon.spy(howlerIntegration2.sounds.heavyCoin, 'fade');
      lightCoinFadeSpy = sinon.spy(howlerIntegration2.sounds.lightCoin, 'fade');
      randomCoinsFadeSpy = sinon.spy(
        howlerIntegration2.sounds.randomCoins,
        'fade'
      );
    });
    afterEach(() => {
      playSpy.resetHistory();
      addSpy.resetHistory();
      heavyCoinSpy.resetHistory();
      lightCoinSpy.resetHistory();
      randomCoinsSpy.resetHistory();
      proxySpy.resetHistory();
      heavyCoinStopSpy.resetHistory();
      lightCoinStopSpy.resetHistory();
      randomCoinsStopSpy.resetHistory();
      heavyCoinFadeSpy.resetHistory();
      lightCoinFadeSpy.resetHistory();
      randomCoinsFadeSpy.resetHistory();
    });
    after(() => {
      playSpy.restore();
      addSpy.restore();
      heavyCoinSpy.restore();
      lightCoinSpy.restore();
      randomCoinsSpy.restore();
      proxySpy.restore();
      heavyCoinStopSpy.restore();
      lightCoinStopSpy.restore();
      randomCoinsStopSpy.restore();
      heavyCoinFadeSpy.restore();
      lightCoinFadeSpy.restore();
      randomCoinsFadeSpy.restore();
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
        expect(addSpy).to.have.been.calledOnce;
        expect(expected).to.deep.equal(playingNames);
      });
    });

    it('invokes .play with heavyCoin', () => {
      const heavyAction = {
        name: 'HEAVY_COIN',
        meta: { sound: { play: 'heavyCoin' } }
      };
      actionHandler(heavyAction);

      expect(playSpy).to.have.been.calledOnce;
      expect(playSpy).to.have.been.calledWithExactly('heavyCoin', undefined);
      expect(heavyCoinSpy).to.have.been.calledOnce;
      expect(heavyCoinSpy).to.have.been.calledWithExactly(undefined);
    });
  });
});
