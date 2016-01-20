// Catch 'sound effect' events, and interface with HTML5 Audio
import soundEffects from '../lib/sound_effects.lib';


function soundMiddleware(store) {
  return next => action => {
    // Ignore actions that haven't specified a sound.
    if ( !action.meta || !action.meta.sound ) {
      return next(action);
    }

    const soundName = action.meta.sound;

    // Check to make sure the sound exists.
    if ( typeof soundEffects.sounds[soundName] === 'undefined' ) {
      console.warn(`
        The sound effect '${soundName}' was requested, but not included in the
        list of sound effects. Please check sound_effects.lib.js.
      `);

      return next(action);
    }

    soundEffects.play(soundName);

    return next(action);
  }
}
