/* eslint-disable import/no-extraneous-dependencies */
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
const { HowlerGlobal } = require('howler');
const jsdom = require('jsdom');
// Create a fake DOM for testing with $.ajax
global.window = new jsdom.JSDOM().window;
global.document = window.document;
global.Audio = window.Audio;
global.HTMLElement = window.HTMLElement;
global.HTMLMediaElement = window.HTMLMediaElement;
global.HTMLMediaElement.prototype.load = jest.fn();
global.HTMLMediaElement.prototype.play = jest.fn();

global.HowlerGlobal = HowlerGlobal;
