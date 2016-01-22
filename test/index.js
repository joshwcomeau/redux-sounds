import chai, { expect }   from 'chai';
import { Howl }           from 'howler';
import sinon              from 'sinon';
import sinonChai          from 'sinon-chai';

import soundMiddleware    from '../src/index';
import howlerIntegration  from '../src/howler_integration';

chai.use(sinonChai);


describe('howlerIntegration', () => {
  const soundsData = {
    endTurn: 'path/to/sound.mp3',
    winGame: {
      urls:   ['path/to/other_sound.mp3'],
      volume: 0.75
    }
  };

  const sounds      = howlerIntegration.initialize(soundsData);
  const soundNames  = Object.keys(sounds);
  const soundValues = soundNames.map( name => sounds[name] );

  let actual, expected;

  describe('initialization', () => {
    it('contains keys for each sound name', () => {
      expected = ['endTurn', 'winGame'];
      actual   = soundNames;

      expect(expected).to.deep.equal(actual);
    });

    it('contains Howler instances for each sound value', () => {
      soundValues.forEach( sound => {
        expect(sound).to.be.an.instanceof(Howl);
      });
    });

    it('set up the URL for endTurn (string-based)', () => {
      expected = [ 'path/to/sound.mp3' ];
      actual   = sounds.endTurn._urls;

      expect(expected).to.deep.equal(actual);
    });

    it('set up the URL for winGame (property-based)', () => {
      expected = [ 'path/to/other_sound.mp3' ];
      actual   = sounds.winGame._urls;

      expect(expected).to.deep.equal(actual);
    });

    it('set up the volume for winGame (property-based)', () => {
      expected = 0.75;
      actual   = sounds.winGame._volume;

      expect(expected).to.deep.equal(actual);
    });

    it('offers a "play" method for triggering sounds', () => {
      soundValues.forEach( sound => {
        expect(sound.play).to.be.a('function');
      })
    });
  });

  describe('triggering sounds', () => {
    it('by name', () => {

    })
  })
});


describe('soundMiddleware', () => {
  const soundsData  = { winGame: 'winGame.mp3' };
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
      expect(soundMiddleware).to.throw({ name: 'missingSoundDataaaa'});
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
    it('forwards actions with no meta.sound', () => {
      const action = { name: 'UNRELATED_ACTION' };
      actionHandler(action);

      expect(consoleStub).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it('forwards actions with meta.sound', () => {
      // The actual playing of the sound is tested in howlerIntegration above.
      const action = { name: 'WIN_GAME', meta: { sound: 'winGame'} };
      actionHandler(action);

      expect(consoleStub).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it('console.warns when the sound is not found', () => {
      const action = { name: 'LOSE_GAME', meta: { sound: 'loseGame'} };
      actionHandler(action);

      expect(consoleStub).to.have.been.calledOnce;
      expect(next).to.have.been.calledOnce;
    });
  });
});
