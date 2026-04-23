import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllUser,
  getNumberOfUser,
  getNumberOfTest,
  getAllHistoryTest,
  getAllTest,
  getPermissionOfUser,
  updatePermissionOfUser,
  addPermissionForUser,
  detelePermissionOfUser,
  addUser,
  deleteUser,
  updateUserByAdmin,
  lockAccountByAdmin,
  getRevenue,
  getAllPayment,
  confirmRegisterCourse,
  cancelRegisterCourse,
  deleteTest,
  createTest,
  updateTest,
  uploadImage,
  uploadAudio,
} from "../../service/adminService";

// Lấy tất cả thông tin user
export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllUser();
      const users = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
      return users;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy danh sách người dùng"
      );
    }
  }
);

// Lấy số lượng user
export const fetchNumberOfUsers = createAsyncThunk(
  "admin/fetchNumberOfUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getNumberOfUser();
      return Number(response?.data?.totalUsers ?? 0);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy số lượng người dùng"
      );
    }
  }
);

// Lấy số lượng bài test
export const fetchNumberOfTests = createAsyncThunk(
  "admin/fetchNumberOfTests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getNumberOfTest();
      return Number(response?.data?.totalTests ?? 0);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy số lượng bài test"
      );
    }
  }
);

// Lấy lịch sử làm bài
export const fetchAllHistoryTests = createAsyncThunk(
  "admin/fetchAllHistoryTests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllHistoryTest();
      const historyTests = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      return historyTests.map((result) => ({
        idTestHistory: result.historyOfTestID,
        testName: result.testName,
        userName: result.userName,
        score: result.scoreTotal,
        dateTest: result.dateTest,
      }));
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy lịch sử bài thi"
      );
    }
  }
);

// Lấy tất cả bài thi
export const fetchAllTests = createAsyncThunk(
  "admin/fetchAllTests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllTest();
      const tests = Array.isArray(response.data) ? response.data : [];
      return tests.map((test) => ({
        idTest: test.idTest,
        testName: test.testName,
        numberOfQuestion: parseInt(test.numberOfQuestion, 10),
      }));
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy danh sách bài test"
      );
    }
  }
);

// Lấy quyền của user
export const fetchPermissionOfUser = createAsyncThunk(
  "admin/fetchPermissionOfUser",
  async ({ idUser }, { rejectWithValue }) => {
    try {
      const response = await getPermissionOfUser({ idUser: idUser });
      return response.data.permissions;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy quyền của người dùng"
      );
    }
  }
);

// Cập nhật quyền của user
export const fetchUpdatePermissionOfUser = createAsyncThunk(
  "admin/fetchUpdatePermissionOfUser",
  async ({ idUser, namePermission, typeUpdate }, { rejectWithValue }) => {
    try {
      const response = await updatePermissionOfUser({
        idUser,
        namePermission,
        typeUpdate,
      });
      if (response.status == 200) {
        return response.data;
      } else {
        return rejectWithValue(
          "Lỗi khi cập nhật quyền của người dùng! Vui lòng thử lại."
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi cập nhật quyền của người dùng"
      );
    }
  }
);
// Thêm quyền cho user
export const fetchAddPermissionForUser = createAsyncThunk(
  "admin/fetchAddPermissionForUser",
  async ({ namePermission }, { rejectWithValue }) => {
    try {
      const response = await addPermissionForUser({ namePermission });
      if (response.status == 200) {
        return response.data;
      }
      return rejectWithValue(
        "Lỗi khi thêm quyền cho người dùng! Vui lòng thử lại."
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi thêm quyền cho người dùng"
      );
    }
  }
);

// Xóa quyền của user
export const fetchDeletePermissionOfUser = createAsyncThunk(
  "admin/fetchDeletePermissionOfUser",
  async ({ permissionId }, { rejectWithValue }) => {
    try {
      const response = await detelePermissionOfUser({
        permissionId,
      });
      if (response.status == 200) {
        return response.data;
      } else {
        return rejectWithValue(
          "Lỗi khi xóa quyền của người dùng! Vui lòng thử lại."
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi xóa quyền của người dùng"
      );
    }
  }
);
// Thêm mới user
export const fetchAddUser = createAsyncThunk(
  "admin/fetchAddUser",
  async (
    { userName, password, gmail, phone, name, roleId },
    { rejectWithValue }
  ) => {
    try {
      const response = await addUser({
        userName,
        password,
        gmail,
        phone,
        name,
        roleId,
      });
      if (response.status === 200 || response.status === 201) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Lỗi khi thêm người dùng! Vui lòng thử lại."
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi thêm người dùng"
      );
    }
  }
);

// Xóa user
export const fetchDeleteUser = createAsyncThunk(
  "admin/fetchDeleteUser",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await deleteUser({ userId });
      if (response.status === 200) {
        return response.data;
      } else {
        return rejectWithValue("Lỗi khi xóa người dùng! Vui lòng thử lại.");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi xóa người dùng"
      );
    }
  }
);

export const fetchUpdateUserByAdmin = createAsyncThunk(
  "admin/fetchUpdateUserByAdmin",
  async ({ userId, name, phone }, { rejectWithValue }) => {
    try {
      const response = await updateUserByAdmin({ userId, name, phone });
      if (response.status === 200) {
        return response.data;
      }
      return rejectWithValue("Lỗi khi cập nhật người dùng");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi cập nhật người dùng"
      );
    }
  }
);

export const fetchLockAccountByAdmin = createAsyncThunk(
  "admin/fetchLockAccountByAdmin",
  async ({ userId, lock }, { rejectWithValue }) => {
    try {
      const response = await lockAccountByAdmin({ userId, lock });
      if (response.status === 200) {
        return response.data;
      }
      return rejectWithValue("Lỗi khi cập nhật trạng thái tài khoản");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái tài khoản"
      );
    }
  }
);

// Doanh thu
export const fetchRevenue = createAsyncThunk(
  "admin/fetchRevenue",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRevenue();
      if (response.status === 200) {
        return {
          totalAmount: Number(response?.data?.totalAmount || 0),
          numberTransaction: Number(response?.data?.numberTransaction || 0),
        };
      } else {
        return rejectWithValue("Lỗi khi lấy doanh thu");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy doanh thu"
      );
    }
  }
);

// Lấy tất cả giao dịch
export const fetchTransaction = createAsyncThunk(
  "admin/fetchTransaction",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllPayment();

      const rows = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      return rows.map((item) => ({
        registerCourseId: item.registerCourseId,
        id: item.registerCourseId ?? item.courseId,
        userId: item.userId,
        courseId: item.courseId,
        userName: item.student?.name || item.student?.userName || "N/A",
        amount: Number(item.totalAmount || 0),
        totalAmount: Number(item.totalAmount || 0),
        totalAmountOfTeacher: Number(item.totalAmountOfTeacher || 0),
        date: item.date,
        confirmDate: item.confirmDate,
        status: item.status || "pending",
      }));
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy danh sách giao dịch"
      );
    }
  }
);

export const fetchConfirmRegisterCourse = createAsyncThunk(
  "admin/fetchConfirmRegisterCourse",
  async ({ registerCourseId }, { rejectWithValue }) => {
    try {
      const response = await confirmRegisterCourse({ registerCourseId });
      const isAxiosResponse = typeof response?.status === "number";
      const isSuccess =
        (isAxiosResponse && response.status >= 200 && response.status < 300) ||
        (!isAxiosResponse && (response?.success === true || response?.message || response?.data));

      if (isSuccess) {
        return isAxiosResponse ? response.data : response;
      }
      return rejectWithValue(response?.message || "Lỗi khi xác nhận giao dịch");
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Lỗi khi xác nhận giao dịch"
      );
    }
  }
);

export const fetchCancelRegisterCourse = createAsyncThunk(
  "admin/fetchCancelRegisterCourse",
  async ({ registerCourseId }, { rejectWithValue }) => {
    try {
      const response = await cancelRegisterCourse({ registerCourseId });
      const isAxiosResponse = typeof response?.status === "number";
      const isSuccess =
        (isAxiosResponse && response.status >= 200 && response.status < 300) ||
        (!isAxiosResponse && (response?.success === true || response?.message || response?.data));

      if (isSuccess) {
        return isAxiosResponse ? response.data : response;
      }
      return rejectWithValue(response?.message || "Lỗi khi hủy giao dịch");
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Lỗi khi hủy giao dịch"
      );
    }
  }
);
// Xóa đề thi
export const fetchDeleteTest = createAsyncThunk(
  "admin/fetchDeleteTest",
  async ({ testId }, { rejectWithValue }) => {
    try {
      const response = await deleteTest({ testId });
      if (response.status === 200) {
        return response.data;
      } else {
        return rejectWithValue(
          response?.message || "Lỗi khi xóa đề thi! Vui lòng thử lại."
        );
      }
    } catch (error) {
      return rejectWithValue(error.response?.message || "Lỗi khi xóa đề thi");
    }
  }
);

// Thêm đề thi
export const fetchCreateTest = createAsyncThunk(
  "admin/fetchCreateTest",
  async (
    { testName, year, duration, parts, questions },
    { rejectWithValue }
  ) => {
    try {
      const response = await createTest({
        testName,
        year,
        duration,
        parts,
        questions,
      });
      if (response.status === 200) {
        return response.data;
      } else {
        return rejectWithValue(
          response?.message || "Lỗi khi thêm đề thi! Vui lòng thử lại."
        );
      }
    } catch (error) {
      return rejectWithValue(error.response?.message || "Lỗi khi thêm đề thi");
    }
  }
);

// Cập nhật đề thi
export const fetchUpdateTest = createAsyncThunk(
  "admin/fetchUpdateTest",
  async (
    { testId, testName, year, duration, parts, questions },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateTest({
        testId,
        testName,
        year,
        duration,
        parts,
        questions,
      });
      if (response.status === 200) {
        return response.data;
      } else {
        return rejectWithValue(
          response?.message || "Lỗi khi cập nhật đề thi! Vui lòng thử lại."
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.message || "Lỗi khi cập nhật đề thi"
      );
    }
  }
);

// Tải ảnh lên
export const fetchUploadImage = createAsyncThunk(
  "admin/fetchUploadImage",
  async ({ fileImage }, { rejectWithValue }) => {
    try {
      const response = await uploadImage({ fileImage });
      if (response.status === 200) {
        return response.data;
      } else {
        return rejectWithValue(
          response?.message || "Lỗi khi tải ảnh lên! Vui lòng thử lại."
        );
      }
    } catch (error) {
      return rejectWithValue(error.response?.message || "Lỗi khi tải ảnh lên");
    }
  }
);

// Tải audio lên
export const fetchUploadAudio = createAsyncThunk(
  "admin/fetchUploadAudio",
  async ({ fileAudio }, { rejectWithValue }) => {
    try {
      const response = await uploadAudio({ fileAudio });
      if (response.status === 200) {
        return response.data;
      } else {
        return rejectWithValue(
          response?.message || "Lỗi khi tải audio lên! Vui lòng thử lại."
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.message || "Lỗi khi tải audio lên"
      );
    }
  }
);

const initialState = {
  users: [],
  numberOfUsers: 0,
  numberOfTests: 0,
  historyTests: [],
  tests: [],
  permissionOfUser: [],
  revenue: {
    totalAmount: 0,
    numberTransaction: 0,
  },
  transactions: [],
  tempExam: {
    idTest: "",
    testName: "",
    year: "",
    duration: "",
    parts: [],
    questions: [],
  },
  loading: false,
  loadingUser: false,
  loadingHistoryTest: false,
  loadingTest: false,
  loadingRevenue: false,
  loadingTransaction: false,
  loadingUpdateExam: false,
  loadingEditExam: false,
  error: null,
  errorUser: null,
  errorHistoryTest: null,
  errorTest: null,
  errorRevenue: null,
  errorTransaction: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setTempExam(state, action) {
      state.tempExam = action.payload;
    },
    updateTempExamDetails(state, action) {
      const { testName, year, duration } = action.payload;
      if (testName !== undefined) state.tempExam.testName = testName;
      if (year !== undefined) state.tempExam.year = year;
      if (duration !== undefined) state.tempExam.duration = duration;
    },
    addOrUpdateTempPart(state, action) {
      const part = action.payload;
      const existingPartIndex = state.tempExam.parts.findIndex(
        (p) => p.partNumber === part.partNumber
      );
      if (existingPartIndex >= 0) {
        state.tempExam.parts[existingPartIndex] = part;
      } else {
        state.tempExam.parts.push(part);
      }
    },
    addOrUpdateTempQuestion(state, action) {
      const question = action.payload;
      const existingQuestionIndex = state.tempExam.questions.findIndex(
        (q) =>
          q.partNumber === question.partNumber &&
          q.questionNumber === question.questionNumber
      );
      if (existingQuestionIndex >= 0) {
        state.tempExam.questions[existingQuestionIndex] = question;
      } else {
        state.tempExam.questions.push(question);
      }
    },
    resetTempExam(state) {
      state.tempExam = initialState.tempExam;
    },
    removeTempQuestion(state, action) {
      const { partNumber, questionNumber } = action.payload;
      state.tempExam.questions = state.tempExam.questions.filter(
        (q) =>
          !(q.partNumber === partNumber && q.questionNumber === questionNumber)
      );
    },
  },
  extraReducers: (builder) => {
    // fetchAllUsers
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loadingUser = true;
        state.errorUser = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loadingUser = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loadingUser = false;
        state.errorUser = action.payload;
      })

      // fetchNumberOfUsers
      .addCase(fetchNumberOfUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNumberOfUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.numberOfUsers = action.payload;
      })
      .addCase(fetchNumberOfUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchNumberOfTests
      .addCase(fetchNumberOfTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNumberOfTests.fulfilled, (state, action) => {
        state.loading = false;
        state.numberOfTests = action.payload;
      })
      .addCase(fetchNumberOfTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchAllHistoryTests
      .addCase(fetchAllHistoryTests.pending, (state) => {
        state.loadingHistoryTest = true;
        state.errorHistoryTest = null;
      })
      .addCase(fetchAllHistoryTests.fulfilled, (state, action) => {
        state.loadingHistoryTest = false;
        state.historyTests = action.payload;
      })
      .addCase(fetchAllHistoryTests.rejected, (state, action) => {
        state.loadingHistoryTest = false;
        state.errorHistoryTest = action.payload;
      })

      // fetchAllTests
      .addCase(fetchAllTests.pending, (state) => {
        state.loadingTest = true;
        state.errorTest = null;
      })
      .addCase(fetchAllTests.fulfilled, (state, action) => {
        state.loadingTest = false;
        state.tests = action.payload;
      })
      .addCase(fetchAllTests.rejected, (state, action) => {
        state.loadingTest = false;
        state.errorTest = action.payload;
      })

      // fetchPermissionOfUser
      .addCase(fetchPermissionOfUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissionOfUser.fulfilled, (state, action) => {
        state.loading = false;
        state.permissionOfUser = action.payload;
      })
      .addCase(fetchPermissionOfUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchAddPermissionForUser
      .addCase(fetchAddPermissionForUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddPermissionForUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchAddPermissionForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchDeletePermissionOfUser
      .addCase(fetchDeletePermissionOfUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeletePermissionOfUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchDeletePermissionOfUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchUpdatePermissionOfUser
      .addCase(fetchUpdatePermissionOfUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpdatePermissionOfUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchUpdatePermissionOfUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchAddUser
      .addCase(fetchAddUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchAddUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchDeleteUser
      .addCase(fetchDeleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeleteUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchDeleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchUpdateUserByAdmin
      .addCase(fetchUpdateUserByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpdateUserByAdmin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchUpdateUserByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchLockAccountByAdmin
      .addCase(fetchLockAccountByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLockAccountByAdmin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchLockAccountByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchRevenue
      .addCase(fetchRevenue.pending, (state) => {
        state.loadingRevenue = true;
        state.errorRevenue = null;
      })
      .addCase(fetchRevenue.fulfilled, (state, action) => {
        state.loadingRevenue = false;
        state.revenue = action.payload;
      })
      .addCase(fetchRevenue.rejected, (state, action) => {
        state.loadingRevenue = false;
        state.errorRevenue = action.payload;
      })

      // fetchTransaction
      .addCase(fetchTransaction.pending, (state) => {
        state.loadingTransaction = true;
        state.errorTransaction = null;
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.loadingTransaction = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        state.loadingTransaction = false;
        state.errorTransaction = action.payload;
      })

      // fetchConfirmRegisterCourse
      .addCase(fetchConfirmRegisterCourse.pending, (state) => {
        state.loadingTransaction = true;
        state.errorTransaction = null;
      })
      .addCase(fetchConfirmRegisterCourse.fulfilled, (state) => {
        state.loadingTransaction = false;
      })
      .addCase(fetchConfirmRegisterCourse.rejected, (state, action) => {
        state.loadingTransaction = false;
        state.errorTransaction = action.payload;
      })

      // fetchCancelRegisterCourse
      .addCase(fetchCancelRegisterCourse.pending, (state) => {
        state.loadingTransaction = true;
        state.errorTransaction = null;
      })
      .addCase(fetchCancelRegisterCourse.fulfilled, (state) => {
        state.loadingTransaction = false;
      })
      .addCase(fetchCancelRegisterCourse.rejected, (state, action) => {
        state.loadingTransaction = false;
        state.errorTransaction = action.payload;
      })

      // fetchDeleteTest
      .addCase(fetchDeleteTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeleteTest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchDeleteTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchCreateTest
      .addCase(fetchCreateTest.pending, (state) => {
        state.loadingUpdateExam = true;
        state.error = null;
      })
      .addCase(fetchCreateTest.fulfilled, (state) => {
        state.loadingUpdateExam = false;
        state.tempExam = initialState.tempExam;
      })
      .addCase(fetchCreateTest.rejected, (state, action) => {
        state.loadingUpdateExam = false;
        state.error = action.payload;
      })

      // fetchUpdateTest
      .addCase(fetchUpdateTest.pending, (state) => {
        state.loadingEditExam = true;
        state.error = null;
      })
      .addCase(fetchUpdateTest.fulfilled, (state) => {
        state.loadingEditExam = false;
        state.tempExam = initialState.tempExam;
      })
      .addCase(fetchUpdateTest.rejected, (state, action) => {
        state.loadingEditExam = false;
        state.error = action.payload;
      });

    // // fetchUploadImage
    // .addCase(fetchUploadImage.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    // })
    // .addCase(fetchUploadImage.fulfilled, (state) => {
    //   state.loading = false;
    // })
    // .addCase(fetchUploadImage.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    // })

    // // fetchUploadAudio
    // .addCase(fetchUploadAudio.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    // })
    // .addCase(fetchUploadAudio.fulfilled, (state) => {
    //   state.loading = false;
    // })
    // .addCase(fetchUploadAudio.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    // });
  },
});

export const {
  setTempExam,
  updateTempExamDetails,
  addOrUpdateTempPart,
  addOrUpdateTempQuestion,
  resetTempExam,
  removeTempQuestion,
} = adminSlice.actions;

export default adminSlice.reducer;
