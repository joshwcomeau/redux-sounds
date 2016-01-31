// Test suite coverage
// Sadly, Howler.js will not try to load or play any sounds when there is
// no audio environment available. Node has no audio environment.
// We'll test the middleware instantiation, how it handles actions, whether
// it hands the right data to Howler, and some other configuration stuff.
//
import chai, { expect }   from 'chai';
import { Howl }           from 'howler';
import sinon              from 'sinon';
import sinonChai          from 'sinon-chai';

import soundMiddleware    from '../src/index';
import howlerIntegration  from '../src/howler_integration';

chai.use(sinonChai);


const soundsData = {
  endTurn: 'path/to/sound.mp3',
  winGame: {
    urls:   ['path/to/other_sound.mp3'],
    volume: 0.75
  },
  allSounds: {
    urls: ['sound1.mp3'],
    sprite: {
      boom:   [0, 1000],
      bang:   [1500, 2000],
      crash:  [2000,2345]
    }
  }
};


describe('howlerIntegration', () => {
  const sounds      = howlerIntegration.initialize(soundsData);
  const soundNames  = Object.keys(sounds);
  const soundValues = soundNames.map( name => sounds[name] );

  let actual, expected;

  describe('#initialize', () => {
    it('contains keys for each sound name', () => {
      expected  = ['endTurn', 'winGame', 'allSounds'];
      actual    = soundNames;

      expect(expected).to.deep.equal(actual);
    });

    it('contains Howler instances for each sound value', () => {
      soundValues.forEach( sound => {
        expect(sound).to.be.an.instanceof(Howl);
      });
    });

    it('set up the URL for endTurn (string-based)', () => {
      expected  = [ 'path/to/sound.mp3' ];
      actual    = sounds.endTurn._urls;

      expect(expected).to.deep.equal(actual);
    });

    it('set up the URL for winGame (property-based)', () => {
      expected  = [ 'path/to/other_sound.mp3' ];
      actual    = sounds.winGame._urls;

      expect(expected).to.deep.equal(actual);
    });

    it('set up the volume for winGame (property-based)', () => {
      expected  = 0.75;
      actual    = sounds.winGame._volume;

      expect(expected).to.deep.equal(actual);
    });

    it('set up the sprites for allSounds', () => {
      expected  = { boom: [0, 1000], bang: [1500, 2000], crash: [2000,2345] };
      actual    = sounds.allSounds._sprite;

      expect(expected).to.deep.equal(actual);
    });

    it('offers a "play" method for triggering sounds', () => {
      soundValues.forEach( sound => {
        expect(sound.play).to.be.a('function');
      })
    });
  });
});


describe('soundMiddleware', () => {
  const next        = sinon.spy();
  const consoleStub = sinon.stub(console, 'warn');

  let storeHandler, nextHandler, actionHandler;

  afterEach( () => {
    // reset our spies and stubs
    consoleStub.reset();
    next.reset();
  });

  describe('initialization', () => {
    it('throws when initialized without sounds', () => {
      expect(soundMiddleware).to.throw();
    });
  });

  describe('curried application', () => {
    it('loads the middleware with sounds data, returns a function', () => {
      storeHandler = soundMiddleware(soundsData);
      expect(storeHandler).to.be.a('function')
    });

    it('loads the store, and returns a function', () => {
      // We don't use the store in my middleware at all.
      // Pass in an empty object, just to match the real-world input type.
      nextHandler = storeHandler({});
      expect(nextHandler).to.be.a('function')
    });

    it('loads next, and returns a function', () => {
      actionHandler = nextHandler(next);
      expect(actionHandler).to.be.a('function')
    });
  });

  describe('dispatching actions', () => {
    it('console.warns when the sound is not found', () => {
      const action = { name: 'LOSE_GAME', meta: { sound: 'loseGame'} };
      actionHandler(action);

      expect(consoleStub).to.have.been.calledOnce;
      expect(next).to.have.been.calledOnce;
    });

    it('console.warns when the sound is found, but not the sprite', () => {
      const action = { name: 'CLANG', meta: { sound: 'allSounds.clang'} };
      actionHandler(action);

      expect(consoleStub).to.have.been.calledOnce;
      expect(next).to.have.been.calledOnce;
    });

    it('forwards actions with no meta.sound', () => {
      const action = { name: 'UNRELATED_ACTION' };
      actionHandler(action);

      expect(consoleStub).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it('forwards actions with meta.sound', () => {
      const action = { name: 'WIN_GAME', meta: { sound: 'winGame'} };
      actionHandler(action);

      expect(consoleStub).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });
  });

  describe('howlerIntegration handoff', () => {
    let playSpy, endTurnSpy, winGameSpy, allSoundsSpy;

    before( () => {
      playSpy       = sinon.spy(howlerIntegration, 'play');
      endTurnSpy    = sinon.spy(howlerIntegration.sounds.endTurn, 'play');
      winGameSpy    = sinon.spy(howlerIntegration.sounds.winGame, 'play');
      allSoundsSpy  = sinon.spy(howlerIntegration.sounds.allSounds, 'play');
    });
    afterEach( () => {
      playSpy.reset();
      endTurnSpy.reset();
      winGameSpy.reset();
      allSoundsSpy.reset();
    });
    after( () => {
      playSpy.restore();
      endTurnSpy.restore();
      winGameSpy.restore();
      allSoundsSpy.restore();
    });

    it('invokes .play with endTurn', () => {
      const action = { name: 'END_TURN', meta: { sound: 'endTurn'} };
      actionHandler(action);

      expect(playSpy).to.have.been.calledOnce;
      expect(playSpy).to.have.been.calledWithExactly('endTurn', undefined);
      expect(endTurnSpy).to.have.been.calledOnce;
      expect(endTurnSpy).to.have.been.calledWithExactly(undefined);
    });

    it('invokes .play with winGame', () => {
      const action = { name: 'WIN_GAME', meta: { sound: 'winGame'} };
      actionHandler(action);

      expect(playSpy).to.have.been.calledOnce;
      expect(playSpy).to.have.been.calledWithExactly('winGame', undefined);
      expect(winGameSpy).to.have.been.calledOnce;
      expect(winGameSpy).to.have.been.calledWithExactly(undefined);
    });

    it('invokes .play with allSounds (with spriteName)', () => {
      const action = { name: 'BOOM', meta: { sound: 'allSounds.boom'} };
      actionHandler(action);

      expect(playSpy).to.have.been.calledOnce;
      expect(playSpy).to.have.been.calledWithExactly('allSounds', 'boom');
      expect(allSoundsSpy).to.have.been.calledOnce;
      expect(allSoundsSpy).to.have.been.calledWithExactly('boom');
    });
  });
});
