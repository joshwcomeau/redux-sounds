import chai, { expect } from 'chai';
import { Howl }         from 'howler';
import sinon            from 'sinon';
import sinonChai        from 'sinon-chai';

import soundMiddleware  from '../src/index';

chai.use(sinonChai);


describe('soundMiddleware', () => {
  const soundsData = {
    endTurn: 'path/to/sound.mp3',
    winGame: {
      urls:   ['path/to/other_sound.mp3'],
      volume: 0.75
    }
  };

  const next = sinon.spy();
  const store = {}; // unused in my middleware, atm.
  const consoleStub = sinon.stub(console, 'warn');

  let loadedMiddleware, nextHandler, actionHandler;


  afterEach( () => {
    // reset our spies and stubs
    consoleStub.reset();
    next.reset();
  });

  it('throws when initialized without sounds', () => {
    expect(soundMiddleware).to.throw({ name: 'missingSoundDataaaa'});
  });

  describe('curried application', () => {
    it('loads the middleware with sounds data, returns a function', () => {
      loadedMiddleware = soundMiddleware(soundsData);
      expect(loadedMiddleware).to.be.a('function')
    });
    it('loads the store, and returns a function', () => {
      nextHandler = loadedMiddleware(store);
      expect(nextHandler).to.be.a('function')
    });
    it('loads next, and returns a function', () => {
      nextHandler = loadedMiddleware(store);
      expect(nextHandler).to.be.a('function')
    });
    it('loads the store, and returns a function', () => {
      actionHandler = nextHandler(next);
      expect(actionHandler).to.be.a('function')
    });
  });

  describe('dispatching actions', () => {
    it('ignores actions with no meta.sound', () => {
      const action = { name: 'UNRELATED_ACTION' };
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

    it('invokes .play on the sound requested', () => {
      const action = { name: 'WIN_GAME', meta: { sound: 'winGame'} };
      actionHandler(action);

      expect(consoleStub).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });
  });
});
