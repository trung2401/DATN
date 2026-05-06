Project: ToeicZone (DATN)

Purpose: This document summarizes the main features of the project, the backend (BE) REST endpoints and controllers, and the frontend (FE) service functions that call them. Use this as a quick reference when adding features or maintaining API integration.

---

**1. High-level features**

- Authentication & user management (login/register, refresh token, profile)
- Role-aware routes: ADMIN, TEACHER, USER
- Course catalog and curriculum (open courses, course details, registration)
- Lessons (video/exercise uploads) and Lesson viewing
- Register / payment for courses
- 1:1 Chat between teacher and student (REST + Socket.IO realtime)
- Exam/test management (create tests, groups, questions, take/submit tests)
- Teacher & Admin dashboards (revenue, tests, released courses)
- Vocabulary & personal note lists
- File uploads (images, audio, lesson assets)

---

**2. Backend routes (summary) and controllers**

Files under `lms-backend/src/routes` map to controller functions under `lms-backend/src/controllers`.
Below are the important route groups and endpoints (path shown as used by FE services):

- Auth / User
  - POST /auth/login  -> authController.login
  - POST /auth/register -> authController.register
  - POST /auth/logout -> authController.logout
  - POST /auth/refresh-token -> authController.handleRefreshToken
  - PUT  /auth/change-password -> authController.changePassword
  - GET  /auth/me -> userController.getMe
  - PUT  /auth/update -> userController.updateProfile
  - POST /auth/create -> userController.createUserByAdmin
  - PUT  /auth/lock/:id -> userController.lockAccount
  - PUT  /auth/admin-update/:id -> userController.updateUserByAdmin
  - GET  /auth/getAllUsers -> userController.getAllUsers
  - GET  /auth/getAllRoles -> userController.getAllRoles
  - GET  /auth/getTotalUsersCount -> userController.getTotalUsersCount

- Courses
  - GET  /course/getAllCourses -> courseController.getAllCourses (teacher view)
  - GET  /course/getAllCoursesByStudent -> courseController.getAllCoursesByStudent (public list)
  - GET  /course/getStudentCountByCourse -> courseController.getStudentCountByCourse
  - POST /course/add -> courseController.createCourse
  - DELETE /course/:id -> courseController.deleteCourse
  - PUT  /course/:id -> courseController.updateCourse
  - PUT  /course/:id/set-status -> courseController.setStatusCourse

- Lessons
  - GET  /lession/getAll?courseId=... -> lessionController.getAllLessions
  - POST /lession/files/upload/video -> lessionController.uploadLessionFile
  - POST /lession/files/upload/exercise -> lessionController.uploadLessionFile
  - POST /lession/add -> lessionController.createLession
  - PUT  /lession/:id -> lessionController.updateLession
  - DELETE /lession/:id -> lessionController.deleteLession

- Register Course (payments/registrations)
  - POST /register-course/add -> registerCourseController.createRegisterCourse
  - PUT  /register-course/:id/confirm -> registerCourseController.updateRegisterCourseStatusConfirmed
  - PUT  /register-course/:id/cancel -> registerCourseController.updateRegisterCourseStatusCancel
  - GET  /register-course/getAll -> registerCourseController.getAllRegisterCourses
  - GET  /register-course/getTotalRevenueConfirmed -> registerCourseController.getTotalRevenueConfirmed

- Chat
  - GET  /chat/teachers -> chatController.getAvailableTeachers
  - GET  /chat/students -> chatController.getAvailableStudents
  - POST /chat/conversations/get-or-create -> chatController.getOrCreateConversation
  - GET  /chat/conversations -> chatController.getMyConversations
  - GET  /chat/conversations/:conversationId/messages -> chatController.getMessagesByConversation
  - POST /chat/conversations/:conversationId/messages -> chatController.sendMessage
  - PUT  /chat/conversations/:conversationId/read -> chatController.markConversationAsRead
  - Socket.IO server implemented in `src/socket/chatSocket.js` for realtime `chat:newMessage`, `chat:readUpdated`, etc.

- Tests / Exam
  - GET  /test/getAllTest -> testController.getAllTest
  - GET  /test/getTestByUserID/:userId -> testController.getTestByUserID
  - GET  /test/getTest -> testController.getTest
  - GET  /test/getTotalTestsCount -> testController.getTotalTestsCount
  - GET  /test/getTotalAttemptsByUser/:userId -> testController.getTotalAttemptsByUser
  - GET  /test/getAverageTestScoreByUser/:userId -> testController.getAverageTestScoreByUser
  - GET  /test/getResultListByUser/:userId -> testController.getResultListByUser
  - GET  /test/getResultList -> testController.getResultList
  - POST /test/files/upload/audio -> testController.uploadAudio
  - POST /test/files/upload/image -> testController.uploadImage
  - POST /test/add -> testController.createTest
  - PUT  /test/:id -> testController.updateTest
  - PUT  /test/:id/set-status -> testController.setStatusTest
  - GET  /test/:testId/groups -> testController.getGroupsByPart
  - POST /test/:testId/groups -> testController.createQuestionGroup
  - POST /test/:testId/questions/single -> testController.addSingleQuestion
  - POST /test/:testId/groups/:dataQuestionId/questions -> testController.addQuestionToGroup
  - GET  /test/:testId/questions/manage -> testController.getQuestionsByPartForManage
  - PUT  /test/:testId/questions/:questionId -> testController.updateSingleQuestion
  - DELETE /test/:testId/questions/:questionId -> testController.deleteQuestion
  - PUT  /test/:testId/groups/:dataQuestionId -> testController.updateQuestionGroup
  - DELETE /test/:testId/groups/:dataQuestionId -> testController.deleteQuestionGroup
  - GET  /test/get/test/:testId -> testController.getTestById
  - POST /test/:testId/start -> testController.startTest
  - POST /test/submit -> testController.submitTest
  - GET  /test/result/:historyOfTestID -> testController.getTestResult

- Vocabulary lists
  - GET  /vocabulary-list/getAllVocabularyLists -> vocabularyListController.getAllVocabularyLists
  - GET  /vocabulary-list/getAllVocabularyListsByUserId/:userId -> vocabularyListController.getAllVocabularyListsByUserId
  - GET  /vocabulary-list/my-vocab -> vocabularyController.getMyVocab
  - GET  /vocabulary-list/:id -> vocabularyListController.getVocabularyListDetail
  - GET  /vocabulary-list/:id/vocabularies -> vocabularyListController.getAllVocabularyOfList
  - POST /vocabulary-list/add -> vocabularyListController.createVocabularyList
  - PUT  /vocabulary-list/:id -> vocabularyListController.updateVocabularyList
  - DELETE /vocabulary-list/:id -> vocabularyListController.deleteVocabularyList
  - POST /vocabulary-list/:id/vocabularies -> vocabularyController.addVocabulary
  - PUT  /vocabulary-list/vocabularies/:vocabId -> vocabularyController.updateVocabulary
  - DELETE /vocabulary-list/vocabularies/:vocabId -> vocabularyController.deleteVocabulary

- Teacher dashboard
  - GET /teacher/dashboard/stats -> teacherDashboardController.getTeacherDashboardStats

- (Other non-standard prefixes used by FE: `exam-service/*`, `payment-service/*`, `user-service/*`, `auth-service/*`) – those appear to be either proxied to other microservices or alternate route namespaces. Check FE service files for exact usage.

---

**3. Frontend service functions (FE) and their BE endpoints**

Important FE service files are under `lms-fe/src/service`. Below I list key exported functions and the BE endpoints they call (exact string used in FE). For each function I show FE function name -> HTTP method -> backend path -> controller where applicable.

Auth (file: `src/service/authService.js`)
- `authLogin({userName,password})` -> POST `/auth/login` -> authController.login
- `authRegister(...)` -> POST `/auth/register` -> authController.register
- `authLogout(...)` -> POST `/auth/logout` -> authController.logout
- `checkRefreshToken(...)` -> POST `/auth/refresh-token` -> authController.handleRefreshToken
- `changePassword` -> PUT `/auth/change-password` -> authController.changePassword
- (note: FE uses `/auth-service/*` for some password/OTP endpoints that are not implemented in the main authRoutes; these may be proxy routes or older endpoints)

User (file: `src/service/userService.js`)
- `getUser()` -> GET `/auth/me` -> userController.getMe
- `updateUser({name, gmail, phone})` -> PUT `/auth/update` -> userController.updateProfile
- `changePassword(...)` -> PUT `/auth/change-password` -> authController.changePassword

Course (file: `src/service/courseService.js`)
- `getOpenCourses()` -> GET `course/getAllCoursesByStudent` -> courseController.getAllCoursesByStudent
- `getCourseCurriculum({courseId})` -> GET `lession/getAll?courseId=${courseId}` -> lessionController.getAllLessions
- `registerCourse({courseId, totalAmount})` -> POST `register-course/add` -> registerCourseController.createRegisterCourse
- `getVocabularyByList({listId})` -> GET `vocabulary-list/${listId}/vocabularies` -> vocabularyListController.getAllVocabularyOfList
- `getVocabularyListInfo({listId})` -> GET `vocabulary-list/${listId}` -> vocabularyListController.getVocabularyListDetail

Chat (file: `src/service/chatService.js`)
- `getTeachersForChat()` -> GET `chat/teachers` -> chatController.getAvailableTeachers
- `getStudentsForChat()` -> GET `chat/students` -> chatController.getAvailableStudents
- `getMyConversations()` -> GET `chat/conversations` -> chatController.getMyConversations
- `getOrCreateConversation({otherUserId})` -> POST `chat/conversations/get-or-create` -> chatController.getOrCreateConversation
- `getConversationMessages({conversationId})` -> GET `chat/conversations/:conversationId/messages` -> chatController.getMessagesByConversation
- `sendChatMessage({conversationId, messageText})` -> POST `chat/conversations/:conversationId/messages` -> chatController.sendMessage
- `markConversationAsRead({conversationId})` -> PUT `chat/conversations/:conversationId/read` -> chatController.markConversationAsRead

Exam/Test (file: `src/service/examService.js`)
- Many functions; examples:
  - `getAllTests()` -> GET `test/getAllTest` -> testController.getAllTest
  - `getExamById({testId})` -> GET `test/getTest?testId=${testId}` -> testController.getTest
  - `startTest({testId})` -> POST `test/${testId}/start` -> testController.startTest
  - `submitTest({historyOfTestID, answers})` -> POST `test/submit` -> testController.submitTest
  - `uploadTestAudio` -> POST `test/files/upload/audio` -> testController.uploadAudio
  - (All other `test/...` endpoints map to functions in `testController`.)

Admin (file: `src/service/adminService.js`)
- `getAllUser()` -> GET `auth/getAllUsers` -> userController.getAllUsers
- `getNumberOfUser()` -> GET `auth/getTotalUsersCount` -> userController.getTotalUsersCount
- `getAllPayment()` -> GET `register-course/getAll` -> registerCourseController.getAllRegisterCourses
- `getRevenue({startDate,endDate})` -> GET `register-course/getTotalRevenueConfirmed` -> registerCourseController.getTotalRevenueConfirmed
- `getAllCourses()` -> GET `course/getAllCourses` -> courseController.getAllCourses
- `createCourse(...)` -> POST `course/add` -> courseController.createCourse
- `updateCourseById(...)` -> PUT `course/:courseId` -> courseController.updateCourse
- `setStatusCourse(...)` -> PUT `course/:courseId/set-status` -> courseController.setStatusCourse
- Course-related and test-related endpoints: FE sometimes uses `exam-service/*` or `exam-service/getTestForEdit` — those map to legacy or proxied endpoints (verify gateway/proxy if present)

Teacher services (examples)
- `teacherDashboardService.getTeacherDashboardStats({startDate,endDate})` -> GET `teacher/dashboard/stats` -> teacherDashboardController.getTeacherDashboardStats
- `teacherCourseService.getTeacherCourses()` -> GET `course/getAllCourses` -> courseController.getAllCourses
- `teacherCourseService.getTeacherLessonsByCourse()` -> GET `lession/getAll` -> lessionController.getAllLessions

Vocabulary & Notes
- `noteService.getNote()` -> GET `/vocabulary-list/my-vocab` -> vocabularyController.getMyVocab
- `noteService.addWord(...)` -> POST `/vocabulary-list/:listId/vocabularies` -> vocabularyController.addVocabulary

Payment
- `paymentService.getQRCode()` -> GET `payment-service/getQR` (external/proxied service)
- `paymentService.checkPayment({code})` -> POST `payment-service/checkPayment`

Misc / Other
- `chatSocketService` manages socket connection to server using token (see `src/service/chatSocketService.js`)
- There are some FE calls that reference `*-service/*` (e.g. `exam-service`, `payment-service`, `user-service`, `auth-service`). Those may be:
  - separate microservices proxied by the backend
  - legacy endpoints
  - or namespaced routes implemented elsewhere.
  Check server proxy configuration or nginx/api gateway settings if you expect those to resolve to local endpoints.

---

**4. How I generated this mapping**

- I inspected the backend route files in `lms-backend/src/routes` and the exported controller functions in `lms-backend/src/controllers`.
- I inspected frontend service files in `lms-fe/src/service` to see exact string paths used by FE for API calls.
- Mapped FE function -> URL string -> server route -> controller function where available.

---

**5. Quick next steps / recommended cleanups**

- Verify `*-service/*` endpoints usage (FE calls them but they may be proxied to other services). If not used, remove or replace.
- Optionally add a small script to auto-scan FE services and BE routes to detect unused endpoints: scan `src/service` for strings used and compare with route files.
- Consider centralizing API paths in a single config to avoid mismatches (e.g., constants for `course/`, `test/`, `auth/`).

---

If you want I can:
- produce a CSV/table listing every FE service function and backend controller function (full file/line references), or
- generate a small script that enumerates FE-used endpoints and reports missing backend routes.

Tell me which output you prefer and I will generate it next.
