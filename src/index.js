const howlerIntegration = require('./howler_integration');
const { isObjectWithValues } = require('./utils');

function soundsMiddleware(soundsData) {
  // Set up our sounds object, and pre-load all audio files.
  // Our sounds object basically just takes the options provided to the
  // middleware, and constructs a new Howl object for each one with them.
  if (soundsData) howlerIntegration.initialize(soundsData);

  return () => (next) => (action) => {
    // Ignore actions that haven't specified a sound.
    if (!action.meta || !isObjectWithValues(action.meta.sound)) {
      return next(action);
    }
    const methods = Object.keys(action.meta.sound);
    methods.forEach((method) => {
      const target = action.meta.sound[method];
      if (method === 'add') {
        howlerIntegration.add(target);
        return;
      }
      // skip action, no Howls initialized
      if (!isObjectWithValues(howlerIntegration.sounds)) return;
      if (method === 'playlist') {
        howlerIntegration.playlist(target);
        return;
      }
      if (Array.isArray(target)) {
        const [soundName, spriteName] = target[0].split('.');
        howlerIntegration.proxy(
          soundName,
          spriteName,
          method,
          ...target.slice(1)
        );
      } else {
        const [soundName, spriteName] = target.split('.');
        howlerIntegration.proxy(soundName, spriteName, method);
      }
    });
    return next(action);
  };
}

module.exports = soundsMiddleware;
