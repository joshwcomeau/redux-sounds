const Howl = require('howler').Howl;

module.exports = {
  initialize(soundsData) {
    let soundOptions;

    const soundNames = Object.getOwnPropertyNames(soundsData);
    return soundNames.reduce((memo, name) => {
      soundOptions = soundsData[name];

      // Allow strings instead of objects, for when all that is needed is a URL
      if ( typeof soundOptions === 'string' ) {
        soundOptions = { urls: [soundOptions] };
      }

      return Object.assign(memo, {
        [name]: new Howl(soundOptions)
      });
    }, {});
  }
}
