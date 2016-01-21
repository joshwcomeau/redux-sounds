const Howl = require('howler').Howl;


function soundsMiddleware(soundData) {
  // Set up our sounds object, and pre-load all audio files.
  // Our sounds object basically just takes the options provided to the
  // middleware, and constructs a new Howl object for each one with them.
  let soundOptions;
  const soundNames = Object.getOwnPropertyNames(soundData);
  const sounds = soundNames.reduce((memo, name) => {
    soundOptions = soundData[name];

    // Allow strings instead of objects, for when all that is needed is a URL
    if ( typeof soundOptions === 'string' ) {
      soundOptions = { urls: [soundOptions] };
    }

    return Object.assign(memo, {
      [name]: new Howl(soundOptions)
    });
  }, {});


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
