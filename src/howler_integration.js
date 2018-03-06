const Howl = require('howler').Howl;
const isObjectWithValues = require('./isObjectWithValues');

module.exports = {
  removeId(id) {
    Object.keys(this.playing).forEach((key) => this.playing[key].delete(id));
  },
  initialize(soundsData) {
    let soundOptions;
    // { String: Set[Integer] } Map of currently playing ids for each unique sound name
    // Can also use `new Map()`
    this.playing = Object.create(null);
    const soundNames = Object.getOwnPropertyNames(soundsData);
    this.sounds = soundNames.reduce((memo, name) => {
      soundOptions = soundsData[name];

      // Allow strings instead of objects, for when all that is needed is a URL
      if (typeof soundOptions === 'string') {
        soundOptions = { src: [soundOptions] };
      }

      const sprites = soundOptions.sprite;
      if (isObjectWithValues(sprites)) {
        Object.keys(sprites).forEach((spriteName) => {
          this.playing[name + spriteName] = new Set();
        });
      } else {
        this.playing[name] = new Set();
      }
      return {
        ...memo,
        [name]: new Howl({
          preload: false,
          ...soundOptions,
          onend: (id) => {
            if (soundOptions.onend) {
              soundOptions.onend(id);
            }
            this.removeId(id);
          },
          onstop: (id) => {
            if (soundOptions.onstop) {
              soundOptions.onstop(id);
            }
            this.removeId(id);
          }
        })
      };
    }, {});
    setTimeout(
      () =>
        Object.keys(this.sounds).forEach((key) => {
          if (this.sounds[key]._preload === false) {
            this.sounds[key].load();
          }
        }),
      100
    );
    return this.sounds;
  },

  proxy(soundName, spriteName, name, ...args) {
    const sound = this.sounds[soundName];
    if (typeof sound === 'undefined') {
      return console.warn(`
      The sound '${soundName}' was requested, but redux-sounds doesn't have anything registered under that name.
      See https://github.com/joshwcomeau/redux-sounds#unregistered-sound
    `);
    } else if (spriteName && typeof sound._sprite[spriteName] === 'undefined') {
      const validSprites = Object.keys(sound._sprite).join(', ');
      return console.warn(`
      The sound '${soundName}' was found, but it does not have a sprite specified for '${spriteName}'.
      It only has access to the following sprites: ${validSprites}.
      See https://github.com/joshwcomeau/redux-sounds#invalid-sprite
    `);
    }
    if (name === 'play') {
      return this.play(soundName, spriteName);
    }
    return this.howlMethod(soundName, spriteName, name, ...args);
  },

  play(soundName, spriteName = '') {
    const sound = this.sounds[soundName];
    const id = sound.play(spriteName);
    if (this.playing[soundName + spriteName]) {
      this.playing[soundName + spriteName].add(id);
    }
    return id;
  },

  howlMethod(soundName, spriteName = '', method, ...args) {
    const sound = this.sounds[soundName];
    if (this.playing[soundName + spriteName]) {
      this.playing[soundName + spriteName].forEach((id) => {
        sound[method](...args, id);
      });
    } else {
      sound[method](...args);
    }
  }
};
