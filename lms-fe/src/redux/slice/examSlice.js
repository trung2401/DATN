import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllTests,
  getExamById,
  submitTest,
  getHistoryExamById,
  startTest,
} from "../../service/examService";

// Lấy tất cả đề thi (có search)
export const fetchAllTests = createAsyncThunk(
  "exam/fetchAllTests",
  async (search = "", { rejectWithValue }) => {
    try {
      const response = await getAllTests({ search });

      const tests = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
          ? response.data
          : [];

      if (Array.isArray(tests)) {
        return tests;
      }

      return rejectWithValue("Không thể tải danh sách đề thi");
    } catch (error) {
      return rejectWithValue(error.message || "Không thể tải danh sách đề thi");
    }
  }
);


// Lấy thông tin đề thi bằng id
export const fetchExamById = createAsyncThunk(
  "exam/fetchExamById",
  async (testId, { rejectWithValue }) => {
    try {
      const response = await getExamById({ testId });
      if (response.status === 200) {
        return response.data;
      } else {
        return rejectWithValue("Không tìm thấy thông tin đề thi");
      }
    } catch (error) {
      return rejectWithValue(
        error.message || "Không tìm thấy thông tin đề thi"
      );
    }
  }
);

export const fetchStartTest = createAsyncThunk(
  "exam/fetchStartTest",
  async (testId, { rejectWithValue }) => {
    try {
      const response = await startTest({ testId });
      if (response.status === 201 || response.status === 200) {
        return response.data;
      }
      return rejectWithValue("Không thể bắt đầu bài thi");
    } catch (error) {
      return rejectWithValue(error.message || "Không thể bắt đầu bài thi");
    }
  }
);

// Nộp bài thi
export const submitExam = createAsyncThunk(
  "exam/submitExam",
  async (examData, { rejectWithValue }) => {
    try {
      const response = await submitTest({
        historyOfTestID: examData?.historyOfTestID,
        answers: (examData?.userAnswers || []).map((item) => ({
          questionId: item.questionId,
          selected: item.userAnswer,
        })),
      });

      if (response.status === 200) {
        return response.data;
      } else {
        return rejectWithValue("Không thể nộp bài thi. Vui lòng thử lại.");
      }
    } catch (error) {
      return rejectWithValue(
        error.message || "Không thể nộp bài thi. Vui lòng thử lại."
      );
    }
  }
);


// Lịch sử làm bài thi theo id
export const fetchHistoryExamById = createAsyncThunk(
  "exam/fetchHistoryExamById",
  async (testId, { rejectWithValue }) => {
    try {
      const response = await getHistoryExamById({ testId });
      if (response?.success) {
        return response;
      } else if (response?.status === 200) {
        return response.data;
      } else {
        return rejectWithValue("Không tìm thấy lịch sử làm bài thi");
      }
    } catch (error) {
      return rejectWithValue(
        error.message || "Không tìm thấy lịch sử làm bài thi"
      );
    }
  }
);


const examSlice = createSlice({
  name: "exam",
  initialState: {
    exams: [],
    loading: false,
    selectedExam: null,
    error: null,
    submitting: false,
    submitError: null,
    submitResult: null,
    historyExamById: null,
  },
  reducers: {
    clearSubmitError: (state) => {
      state.submitError = null;
    },
    resetExamState: (state) => {
      state.exams = [];
      state.selectedExam = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAllTests
      .addCase(fetchAllTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTests.fulfilled, (state, action) => {
        state.loading = false;
        state.exams = action.payload;
      })
      .addCase(fetchAllTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetchExamById
      .addCase(fetchExamById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedExam = null;
      })
      .addCase(fetchExamById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedExam = action.payload;
      })
      .addCase(fetchExamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedExam = null;
      })

      // Handle submitExam
      .addCase(submitExam.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
        state.submitResult = null;
      })
      .addCase(submitExam.fulfilled, (state, action) => {
        state.submitting = false;
        state.submitResult = action.payload;
      })
      .addCase(submitExam.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // Handle fetchHistoryExamById
      .addCase(fetchHistoryExamById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.historyExamById = null;
      })
      .addCase(fetchHistoryExamById.fulfilled, (state, action) => {
        state.loading = false;
        state.historyExamById = action.payload;
      })
      .addCase(fetchHistoryExamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.historyExamById = null;
      })
      
      ;
  },
});

export const { clearSubmitError, resetExamState } = examSlice.actions;
export default examSlice.reducer;
