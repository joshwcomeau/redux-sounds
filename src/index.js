const howlerIntegration = require('./howler_integration');

function soundsMiddleware(soundsData) {
  if ( typeof soundsData !== 'object' )
    throw {
      name: 'missingSoundData',
      message: `
        Please provide an object to soundsMiddleware!
        When initializing, it needs an object holding all desired sound data.
        See https://github.com/joshwcomeau/redux-sounds/#troubleshooting
      `
    };

  // Set up our sounds object, and pre-load all audio files.
  // Our sounds object basically just takes the options provided to the
  // middleware, and constructs a new Howl object for each one with them.
  howlerIntegration.initialize(soundsData);

  return store => next => action => {
    // Ignore actions that haven't specified a sound.
    if ( !action.meta || !action.meta.sound ) {
      return next(action);
    }

    const [ soundName, spriteName ] = action.meta.sound.split('.');

    howlerIntegration.play(soundName, spriteName);

    return next(action);
  };
}

module.exports = soundsMiddleware;
