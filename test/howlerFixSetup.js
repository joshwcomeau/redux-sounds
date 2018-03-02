const { HowlerGlobal } = require('howler');
var jsdom = require('jsdom');
// Create a fake DOM for testing with $.ajax
global.window = new jsdom.JSDOM().window;
global.document = window.document;
global.Audio = window.Audio;
global.HTMLElement = window.HTMLElement;
global.HTMLMediaElement = window.HTMLMediaElement;
global.HTMLMediaElement.prototype.load = function () {};

global.HowlerGlobal = HowlerGlobal;
