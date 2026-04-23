import Home from "../pages/Home";
import Dictionary from "../pages/Dictionary";
import Exam from "../pages/Exam";
import Note from "../pages/Note";
import Login from "../components/Login";
import Register from "../components/Register";
import ForgotPassword from "../components/ForgotPassword";
import TakeTheExam from "../components/Exam/TakeTheExam";
import SubmitExamResult from "../components/Exam/SubmitExamResult";
import AccountInformation from "../components/AccountInformation";
import HistoryExamResult from "../components/Exam/HistoryExamResult";
import AdminLayout from "../layout/AdminLayout";
import TeacherLayout from "../layout/TeacherLayout";
import PublicLayout from "../layout/PublicLayout";

import Dashboard from "../pages/Admin/Dashboard";
import ManageExam from "../pages/Admin/ManageExam";
import ManageUser from "../pages/Admin/ManageUser";
import ManagePayment from "../pages/Admin/ManagePayment";
import ManageCourse from "../pages/Admin/ManageCourse";
import DashboardTeacher from "../pages/Teacher/Dashboard";
import ManageExamTeacher from "../pages/Teacher/ManageExam";
import ManageCourseTeacher from "../pages/Teacher/ManageCourse";
import ManageVocabulary from "../pages/Teacher/ManageVocabulary";
import ForbiddenPage from "../components/ForbiddenPage";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

const routes = [
  {
    layout: PublicLayout,
    children: [
      { path: "/", component: <Home />, protected: false },
      {
        path: "/dictionary",
        component: (
          <PrivateRoute>
            <Dictionary />
          </PrivateRoute>
        ),
        protected: true,
      },
      {
        path: "/exam",
        component: (
          <PrivateRoute>
            <Exam />
          </PrivateRoute>
        ),
        protected: true,
      },
      {
        path: "/exam/take/:testId",
        component: (
          <PrivateRoute>
            <TakeTheExam />
          </PrivateRoute>
        ),
        protected: true,
      },
      {
        path: "/exam/result",
        component: (
          <PrivateRoute>
            <SubmitExamResult />
          </PrivateRoute>
        ),
        protected: true,
      },
      {
        path: "exam/result/:testId",
        component: (
          <PrivateRoute>
            <HistoryExamResult />
          </PrivateRoute>
        ),
      },
      {
        path: "/note",
        component: (
          <PrivateRoute>
            <Note />
          </PrivateRoute>
        ),
        protected: true,
      },
      {
        path: "/login",
        component: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
        protected: false,
      },
      {
        path: "/register",
        component: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
        protected: false,
      },
      {
        path: "/forgotpassword",
        component: (
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        ),
        protected: false,
      },
      {
        path: "/account-info",
        component: (
          <PrivateRoute>
            <AccountInformation />
          </PrivateRoute>
        ),
        protected: true,
      },
      {
        path: "/forbidden",
        component: (
            <ForbiddenPage />
        ),
        protected: false,
      }
    ],
  },
  {
    layout: AdminLayout,
    children: [
      {
        path: "/admin",
        component: (
          <PrivateRoute requiredRole="ADMIN">
            <Dashboard />
          </PrivateRoute>
        ),
        protected: true,
      },
      {
        path: "/admin/exam",
        component: (
          <PrivateRoute requiredRole="ADMIN">
            <ManageExam />
          </PrivateRoute>
        ),
        protected: true,
      },
      {
        path: "/admin/user",
        component: (
          <PrivateRoute requiredRole="ADMIN">
            <ManageUser />
          </PrivateRoute>
        ),
        protected: true,
      },
      {
        path: "/admin/payment",
        component: (
          <PrivateRoute requiredRole="ADMIN">
            <ManagePayment />
          </PrivateRoute>
        ),
        protected: true,
      },
      {
        path: "/admin/course",
        component: (
          <PrivateRoute requiredRole="ADMIN">
            <ManageCourse />
          </PrivateRoute>
        ),
        protected: true,
      },
    ],
  },
  {
    layout: TeacherLayout,
    children: [
      {
        path: "/teacher",
        component: (
          <PrivateRoute requiredRole="TEACHER">
            <DashboardTeacher />
          </PrivateRoute>
        ),
        protected: true,
      },
      {
        path: "/teacher/exam",
        component: (
          <PrivateRoute requiredRole="TEACHER">
            <ManageExamTeacher />
          </PrivateRoute>
        ),
        protected: true,
      },
      {
        path: "/teacher/course",
        component: (
          <PrivateRoute requiredRole="TEACHER">
            <ManageCourseTeacher />
          </PrivateRoute>
        ),
        protected: true,
      },
      {
        path: "/teacher/vocabulary",
        component: (
          <PrivateRoute requiredRole="TEACHER">
            <ManageVocabulary />
          </PrivateRoute>
        ),
        protected: true,
      },
    ],
  },
];

export default routes;