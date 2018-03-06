const howlerIntegration = require('./howler_integration');
const isObjectWithValues = require('./isObjectWithValues');

function soundsMiddleware(soundsData) {
  if (typeof soundsData !== 'object')
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

  return (store) => (next) => (action) => {
    // Ignore actions that haven't specified a sound.
    if (!action.meta || !isObjectWithValues(action.meta.sound)) {
      return next(action);
    }
    const methods = Object.keys(action.meta.sound);
    methods.forEach((method) => {
      const target = action.meta.sound[method];
      if (Array.isArray(target)) {
        const [soundName, spriteName] = target[0].split('.');
        howlerIntegration.proxy(soundName, spriteName, method, ...target.slice(1));
      } else {
        const [soundName, spriteName] = target.split('.');
        howlerIntegration.proxy(soundName, spriteName, method);
      }
    });
    return next(action);
  };
}

module.exports = soundsMiddleware;
