const { Howl } = require('howler');
const { isObjectWithValues } = require('./utils');

module.exports = {
  removeId(id) {
    Object.keys(this.playing).forEach((key) => this.playing[key].delete(id));
  },

  initialize(soundsData, dispatch) {
    // { String: Set[Integer] } Map of currently playing ids for each unique sound name
    // Can also use `new Map()`
    this.playing = Object.create(null);
    const soundNames = Object.getOwnPropertyNames(soundsData);
    this.sounds = soundNames.reduce((memo, name) => {
      let soundOptions = soundsData[name];

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
          ...soundOptions,
          onplay: (id) => {
            if (soundOptions.onplay) soundOptions.onplay(id, dispatch);
          },
          onend: (id) => {
            if (soundOptions.onend) soundOptions.onend(id, dispatch);
            if (!soundOptions.loop) {
              this.removeId(id);
            }
          },
          onstop: (id) => {
            if (soundOptions.onstop) soundOptions.onstop(id, dispatch);
            this.removeId(id);
          }
        })
      };
    }, {});

    return this.sounds;
  },

  add(soundsData, dispatch) {
    if (!isObjectWithValues(this.sounds)) return this.initialize(soundsData);
    const soundNames = Object.getOwnPropertyNames(soundsData);

    this.sounds = soundNames.reduce((memo, name) => {
      let soundOptions = soundsData[name];

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
      const { onplay, onstop, onend } = soundOptions;
      const result = {
        ...memo,
        [name]: new Howl({
          ...soundOptions,
          onplay: (id) => {
            if (onplay) onplay(id, dispatch);
          },
          onend: (id) => {
            if (onend) onend(id, dispatch);
            if (!soundOptions.loop) {
              this.removeId(id);
            }
            if (this.playlistIds && this.playlistIds[id]) {
              this.playlistIds[id](id);
            }
          },
          onstop: (id) => {
            if (onstop) onstop(id);
            this.removeId(id);
          }
        })
      };
      // Delete to keep the action serializable
      delete soundOptions.onplay;
      delete soundOptions.onend;
      delete soundOptions.onstop;
      return result;
    }, this.sounds);

    return this.sounds;
  },

  proxy(soundName, spriteName, name, ...args) {
    const sound = this.sounds[soundName];
    if (typeof sound === 'undefined') {
      return console.warn(`
      The sound '${soundName}' was requested, but redux-sounds doesn't have anything registered under that name.
      See https://github.com/joshwcomeau/redux-sounds#unregistered-sound
    `);
    }
    if (spriteName && typeof sound._sprite[spriteName] === 'undefined') {
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
    const id = sound.play(spriteName || undefined);
    if (this.playing[soundName + spriteName]) {
      this.playing[soundName + spriteName].add(id);
    }
    return id;
  },

  playlist(queue) {
    const playlistId = Math.random().toString().slice(2);
    this.playlist[playlistId] = {
      index: 0,
      queue
    };
    const player = (prevId) => {
      // eslint-disable-next-line no-plusplus
      this.playlist[playlistId].index++;
      const nextTrack =
        this.playlist[playlistId].queue[this.playlist[playlistId].index];
      const nextId = this.play(nextTrack);
      this.playlistIds[nextId] = player;
      delete this.playlistIds[prevId];
    };

    const soundId = this.play(queue[0]);
    this.playlistIds[soundId] = player;
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
