import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMyVocab, getWord, searchWord } from '../../service/dictionaryService';

// Lấy toàn bộ từ vựng của user hiện tại
export const fetchMyVocabulary = createAsyncThunk(
    'dictionary/fetchMyVocabulary',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getMyVocab();
            if (res.status === 200) {
                return {
                    listId: res.data?.listId,
                    words: res.data?.words || []
                };
            }
            return rejectWithValue(res?.message || 'Không thể tải danh sách từ vựng');
        } catch (err) {
            return rejectWithValue(err.response?.message || 'Không thể tải danh sách từ vựng');
        }
    }
);

// Search từ vựng
export const searchVocabulary = createAsyncThunk(
    'dictionary/searchVocabulary',
    async ({ word }, { rejectWithValue }) => {
        try {
            const res = await searchWord({ word });
            if (res.status === 200) {
                return res.data;
            } else {
                return rejectWithValue(res?.message || 'Không thể tìm kiếm từ vựng');
            }
        } catch (err) {
            return rejectWithValue(err.response?.message || 'Không thể tìm kiếm từ vựng');
        }
    }
);

// Get từ vựng
export const getVocabulary = createAsyncThunk(
    'dictionary/getVocabulary',
    async ({ wordId }, { rejectWithValue }) => {
        try {
            const res = await getWord({ wordId });
            if (res.status === 200) {
                return res.data;
            } else {
                return rejectWithValue(res?.message || 'Không thể tìm kiếm chi tiết từ vựng');
            }
        } catch (err) {
            return rejectWithValue(err.response?.message || 'Không thể tìm kiếm chi tiết từ vựng');
        }
    }
);

const dictionarySlice = createSlice({
    name: 'dictionary',
    initialState: {
        words: [], 
        currentWord: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentWord: (state, action) => {
            state.currentWord = action.payload;
        },
        clearCurrentWord: (state) => {
            state.currentWord = null;
        },
        clearListWord: (state) => {
            state.words = [];
        },
    },
    extraReducers: (builder) => {
        // Handle fetchMyVocabulary
        builder
            .addCase(fetchMyVocabulary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyVocabulary.fulfilled, (state, action) => {
                state.loading = false;
                state.words = action.payload.words || [];
            })
            .addCase(fetchMyVocabulary.rejected, (state, action) => {
                state.loading = false;
                state.words = [];
                state.error = action.payload;
            });

        // Handle searchVocabulary
        builder
            .addCase(searchVocabulary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchVocabulary.fulfilled, (state, action) => {
                state.loading = false;
                state.words = action.payload.words || [];
            })
            .addCase(searchVocabulary.rejected, (state, action) => {
                state.loading = false;
                state.words = [];
                state.error = action.payload;
            });

        // Handle getVocabulary
        builder
            .addCase(getVocabulary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getVocabulary.fulfilled, (state, action) => {
                state.loading = false;
                state.currentWord = action.payload;
            })
            .addCase(getVocabulary.rejected, (state, action) => {
                state.loading = false;
                state.currentWord = null;
                state.error = action.payload;
            });
    },
});

export const { clearError, setCurrentWord, clearCurrentWord, clearListWord } = dictionarySlice.actions;

export default dictionarySlice.reducer;