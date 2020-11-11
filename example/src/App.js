import React from 'react';
import logo from './logo.svg';
import { Audio } from './features/audio/Audio';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Audio />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <span>
          <span>Learn </span>
          <a
            className="App-link"
            href="https://github.com/joshwcomeau/redux-sounds#readme"
            target="_blank"
            rel="noopener noreferrer"
          >
            redux-sounds
          </a>
        </span>
      </header>
    </div>
  );
}

export default App;
