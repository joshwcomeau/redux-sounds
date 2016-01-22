const howlerIntegration = require('./howler_integration');


function soundsMiddleware(soundsData) {
  if ( typeof soundsData !== 'object' )
    throw {
      name: 'missingSoundData',
      message: `
        Please provide an object to soundsMiddleware!
        When initializing, it needs an object holding all desired sound data.
        See https://github.com/joshwcomeau/redux-sounds
      `
    };

  // Set up our sounds object, and pre-load all audio files.
  // Our sounds object basically just takes the options provided to the
  // middleware, and constructs a new Howl object for each one with them.
  const sounds = howlerIntegration.initialize(soundsData);


  return store => next => action => {
    // Ignore actions that haven't specified a sound.
    if ( !action.meta || !action.meta.sound ) {
      return next(action);
    }

    const soundName = action.meta.sound;

    // Check to make sure the sound exists.
    if ( typeof sounds[soundName] === 'undefined' ) {
      console.warn(`
        The sound effect '${soundName}' was requested, but not included in the
        list of sound effects. Please check sound_effects.lib.js.
      `);

      return next(action);
    }

    sounds[soundName].play();
    return next(action);
  };
}

module.exports = soundsMiddleware;
