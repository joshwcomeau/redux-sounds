import React from 'react';
import { useDispatch } from 'react-redux';
import {
  fadeEndTurn,
  playEndTurn,
  addSound2,
  playSound2,
  stopSound2
} from './audioSlice';
import styles from './Audio.module.css';

export function Audio() {
  const dispatch = useDispatch();

  return (
    <div>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Play sound 1"
          onClick={() => dispatch(playEndTurn())}
        >
          Play
        </button>
        <span className={styles.value} />
        <button
          className={styles.button}
          aria-label="Stop sound 1"
          onClick={() => dispatch(fadeEndTurn())}
        >
          Stop
        </button>
      </div>
      <div className={styles.row}>
        <button
          className={styles.button}
          onClick={() => dispatch(addSound2())}
        >
          Add sound 2
        </button>
        <button
          className={styles.asyncButton}
          onClick={() => dispatch(playSound2())}
        >
          Play sound 2
        </button>
        <button
          className={styles.asyncButton}
          onClick={() => dispatch(stopSound2())}
        >
          Stop sound 2
        </button>
      </div>
    </div>
  );
}
