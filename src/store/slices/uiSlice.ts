import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  isMobile: boolean;
  scrollPositions: {
    [key: string]: number;
  };
  carouselStates: {
    [key: string]: {
      isAtStart: boolean;
      isAtEnd: boolean;
    };
  };
}

const initialState: UIState = {
  isMobile: false,
  scrollPositions: {},
  carouselStates: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
    setScrollPosition: (state, action) => {
      const { key, position } = action.payload;
      state.scrollPositions[key] = position;
    },
    setCarouselState: (state, action) => {
      const { key, isAtStart, isAtEnd } = action.payload;
      state.carouselStates[key] = { isAtStart, isAtEnd };
    },
    clearScrollPositions: (state) => {
      state.scrollPositions = {};
    },
    clearCarouselStates: (state) => {
      state.carouselStates = {};
    },
  },
});

export const {
  setIsMobile,
  setScrollPosition,
  setCarouselState,
  clearScrollPositions,
  clearCarouselStates,
} = uiSlice.actions;

export default uiSlice.reducer; 