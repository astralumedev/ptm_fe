import { configureStore } from '@reduxjs/toolkit';
import blogReducer from './slices/blogSlice';
import searchReducer from './slices/searchSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    blogs: blogReducer,
    search: searchReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 