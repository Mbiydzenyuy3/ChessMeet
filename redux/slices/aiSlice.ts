import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AISuggestion {
  move: string;
  explanation: string;
}

interface AIState {
  suggestions: AISuggestion[];
  loading: boolean;
  error: string | null;
}

const initialState: AIState = {
  suggestions: [],
  loading: false,
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    fetchAISuggestionsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAISuggestionsSuccess(state, action: PayloadAction<AISuggestion[]>) {
      state.loading = false;
      state.suggestions = action.payload;
    },
    fetchAISuggestionsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAISuggestions(state) {
      state.suggestions = [];
    },
  },
});

export const {
  fetchAISuggestionsStart,
  fetchAISuggestionsSuccess,
  fetchAISuggestionsFailure,
  clearAISuggestions,
} = aiSlice.actions;

export default aiSlice.reducer;
