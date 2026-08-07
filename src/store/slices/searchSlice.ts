import { createSlice } from '@reduxjs/toolkit';
import { Blog } from '@/data/models/Blog';
import { Store } from '@/data/models/Store';

interface SearchState {
  isOpen: boolean;
  query: string;
  history: string[];
  results: {
    blogs: Blog[];
    stores: Store[];
  };
}

const initialState: SearchState = {
  isOpen: false,
  query: '',
  history: [],
  results: {
    blogs: [],
    stores: []
  }
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    toggleSearch: (state) => {
      state.isOpen = !state.isOpen;
    },
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    addToHistory: (state, action) => {
      if (action.payload && !state.history.includes(action.payload)) {
        state.history = [action.payload, ...state.history].slice(0, 10);
      }
    },
    clearHistory: (state) => {
      state.history = [];
    },
    setResults: (state, action) => {
      state.results = action.payload;
    },
    clearResults: (state) => {
      state.results = { blogs: [], stores: [] };
    },
  },
});

export const {
  toggleSearch,
  setQuery,
  addToHistory,
  clearHistory,
  setResults,
  clearResults,
} = searchSlice.actions;

export default searchSlice.reducer; 