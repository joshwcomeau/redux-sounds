const Howl = require('howler').Howl;

module.exports = {
  initialize(soundsData) {
    let soundOptions;

    const soundNames = Object.getOwnPropertyNames(soundsData);

    this.sounds = soundNames.reduce((memo, name) => {
      soundOptions = soundsData[name];

      // Allow strings instead of objects, for when all that is needed is a URL
      if ( typeof soundOptions === 'string' ) {
        soundOptions = { urls: [soundOptions] };
      }

      // TODO: Replace this with a ...merge. Get rid of Object.assign polyfill.
      return Object.assign(memo, {
        [name]: new Howl(soundOptions)
      });
    }, {});

    return this.sounds;
  },

  play(soundName, spriteName) {
    const sound = this.sounds[soundName];

    if ( typeof sound === 'undefined' ) {
      return console.warn(`
        The sound '${soundName}' was requested, but redux-sounds doesn't have anything registered under that name.
        See https://github.com/joshwcomeau/redux-sounds/#troubleshooting
      `);
    } else if ( spriteName && typeof sound._sprite[spriteName] === 'undefined' ) {
      const validSprites = Object.keys(sound._sprite).join(', ');

      return console.warn(`
        The sound '${soundName}' was found, but it does not have a sprite specified for '${spriteName}'.
        It only has access to the following sprites: ${validSprites}.
        See https://github.com/joshwcomeau/redux-sounds/#troubleshooting
      `);
    }

    sound.play(spriteName);
  }
}
