import { configureStore } from '@reduxjs/toolkit';
import soundsMiddleware from '../../../src';
import audioReducer from '../features/audio/audioSlice';

const soundsData = {
  // If no additional configuration is necessary, we can just pass a string  as the path to our file.
  endTurn: `${process.env.PUBLIC_URL}/sound1.mp3`,

  // We will be dynamically loading these commented out sounds
  // heavyCoin: {
  //   src: [
  //     `${process.env.PUBLIC_URL}/sound2.mp3`,
  //     `${process.env.PUBLIC_URL}/sound2.webm`
  //   ],
  //   volume: 0.75
  // },
  //
  // randomCoins: {
  //   src: [`${process.env.PUBLIC_URL}/sound3.wav`],
  //   sprite: {
  //     lowJump: [0, 1000],
  //     longJump: [1000, 2500],
  //     antiGravityJump: [3500, 10000]
  //   }
  // }
};

export default configureStore({
  reducer: {
    audio: audioReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(soundsMiddleware(soundsData))
});
