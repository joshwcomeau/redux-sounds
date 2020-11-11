import { createSlice } from '@reduxjs/toolkit';

import { createAction } from '@reduxjs/toolkit';

export const playEndTurn = createAction('audio/PLAY_END_TURN', () => {
  return {
    meta: {
      sound: {
        play: 'endTurn'
      }
    }
  };
});

export const fadeEndTurn = createAction('audio/STOP_END_TURN', () => {
  return {
    meta: {
      sound: {
        stop: 'endTurn'
      }
    }
  };
});

export const addSound2 = createAction('audio/ADD_SOUND_TWO', () => {
  return {
    meta: {
      sound: {
        add: {
          heavyCoin: {
            src: [
              `${process.env.PUBLIC_URL}/sound2.mp3`,
              `${process.env.PUBLIC_URL}/sound2.webm`
            ],
            volume: 0.75
          }
        }
      }
    }
  };
});

export const playSound2 = createAction('audio/PLAY_SOUND_TWO', () => {
  return {
    meta: {
      sound: {
        play: 'heavyCoin'
      }
    }
  };
});

export const stopSound2 = createAction('audio/STOP_SOUND_TWO', () => {
  return {
    meta: {
      sound: {
        stop: 'heavyCoin'
      }
    }
  };
});

export const audioSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

export const { increment, decrement, incrementByAmount } = audioSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const incrementAsync = (amount) => (dispatch) => {
  setTimeout(() => {
    dispatch(incrementByAmount(amount));
  }, 1000);
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectCount = (state) => state.counter.value;

export default audioSlice.reducer;
