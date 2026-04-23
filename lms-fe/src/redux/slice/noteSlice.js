import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNote,
  addWord,
  updateWord,
  deleteWord,
} from "../../service/noteService";

// Lấy danh sách từ vựng
export const fetchNotes = createAsyncThunk(
  "note/fetchNotes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getNote();
      const listId = response?.data?.listId ?? response?.listId ?? null;
      const wordArray = response?.data?.words || response?.words || [];
      const vocabularies = wordArray.map((w) => ({
        id: w.vocabId,
        listId: w.listId,
        word: w.vocab,
        description: w.mean || "",
        wordType: w.wordType || "",
        pronounce: w.pronunciation || "",
        example: w.example || "",
        status: Number(w.status) === 1 ? 1 : 0,
      }));
      return { listId, vocabularies };
    } catch (err) {
      return rejectWithValue(
        err.response?.message || "Không thể tải danh sách từ vựng."
      );
    }
  }
);

// Thêm từ vựng mới
export const addVocabulary = createAsyncThunk(
  "note/addVocabulary",
  async (
    { word, description, wordType, pronounce, example, status },
    { rejectWithValue, getState }
  ) => {
    try {
      const listId = getState().note.listId;
      if (!listId) {
        return rejectWithValue("Không tìm thấy danh sách từ vựng của bạn.");
      }

      const response = await addWord({
        listId,
        word,
        description,
        wordType,
        pronounce,
        example,
        status: Number(status) === 1 ? 1 : 0,
      });

      const created = response?.data || response;
      if (created?.vocabId || response?.status === 201 || response?.status === 200) {
        return {
          id: created?.vocabId,
          listId: created?.listId || listId,
          word: created?.vocab || word,
          description: created?.mean || description,
          wordType: created?.wordType || wordType,
          pronounce: created?.pronunciation || pronounce,
          example: created?.example || example,
          status:
            created?.status !== undefined
              ? Number(created.status)
              : Number(status) === 1
                ? 1
                : 0,
        };
      } else {
        return rejectWithValue("Không thể thêm từ vựng. Vui lòng thử lại.");
      }
    } catch (err) {
      return rejectWithValue(
        err.response?.message || "Không thể thêm từ vựng."
      );
    }
  }
);

// Xóa từ vựng
export const deleteVocabulary = createAsyncThunk(
  "note/deleteVocabulary",
  async ({ wordId }, { rejectWithValue }) => {
    try {
      const response = await deleteWord({ wordId });
      if (response.status === 200) {
        return { wordId };
      } else {
        return rejectWithValue("Không thể xóa từ vựng. Vui lòng thử lại!");
      }
    } catch (err) {
      return rejectWithValue(err.response?.message || "Không thể xóa từ vựng.");
    }
  }
);

// Cập nhật từ vựng
export const updateVocabulary = createAsyncThunk(
  "note/updateVocabulary",
  async (
    { wordId, word, description, wordType, pronounce, example, status },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateWord({
        wordId,
        word,
        description,
        wordType,
        pronounce,
        example,
        status: Number(status) === 1 ? 1 : 0,
      });
      if (response?.data || response?.status === 200) {
        return {
          wordId,
          word,
          description,
          wordType,
          pronounce,
          example,
          status: Number(status) === 1 ? 1 : 0,
        };
      } else {
        return rejectWithValue("Không thể cập nhật từ vựng. Vui lòng thử lại.");
      }
    } catch (err) {
      return rejectWithValue(
        err.response?.message || "Không thể cập nhật từ vựng."
      );
    }
  }
);

const noteSlice = createSlice({
  name: "note",
  initialState: {
    listId: null,
    vocabularies: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Notes
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.listId = action.payload?.listId || null;
        state.vocabularies = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.vocabularies)
          ? action.payload.vocabularies
          : [];
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.listId = null;
        state.vocabularies = [];
      })
      // Add Vocabulary
      .addCase(addVocabulary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVocabulary.fulfilled, (state, action) => {
        state.loading = false;
        state.vocabularies.push(action.payload);
      })
      .addCase(addVocabulary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Vocabulary
      .addCase(updateVocabulary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVocabulary.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vocabularies.findIndex(
          (v) => v.id === action.payload.wordId
        );
        if (index !== -1) {
          state.vocabularies[index] = {
            ...state.vocabularies[index],
            word: action.payload.word,
            description: action.payload.description,
            wordType: action.payload.wordType,
            pronounce: action.payload.pronounce,
            example: action.payload.example,
            status: action.payload.status,
          };
        }
      })
      .addCase(updateVocabulary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Vocabulary
      .addCase(deleteVocabulary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVocabulary.fulfilled, (state, action) => {
        state.loading = false;
        state.vocabularies = state.vocabularies.filter(
          (v) => v.id !== action.payload.wordId
        );
      })
      .addCase(deleteVocabulary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default noteSlice.reducer;
