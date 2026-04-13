import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { PageWrapper } from "./components/PageWrapper";
import { AuthProvider } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminAssignments from "./pages/admin/AdminAssignments";
import AdminCourses from "./pages/admin/AdminCourses";
// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNotes from "./pages/admin/AdminNotes";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminStudents from "./pages/admin/AdminStudents";

import StudentAssignments from "./pages/student/StudentAssignments";
import StudentCourses from "./pages/student/StudentCourses";
// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentLessons from "./pages/student/StudentLessons";
import StudentNotes from "./pages/student/StudentNotes";
import StudentNotifications from "./pages/student/StudentNotifications";
import StudentProfile from "./pages/student/StudentProfile";
import StudentQuizzes from "./pages/student/StudentQuizzes";
import StudentSchedule from "./pages/student/StudentSchedule";
import StudentScores from "./pages/student/StudentScores";

// ─── Root ───────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  ),
  notFoundComponent: NotFound,
});

// ─── Public ─────────────────────────────────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/login" />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// ─── Admin ───────────────────────────────────────────────────────────────────
const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  component: () => (
    <PageWrapper requiredRole="admin">
      <AdminDashboard />
    </PageWrapper>
  ),
});

const adminCoursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/courses",
  component: () => (
    <PageWrapper requiredRole="admin">
      <AdminCourses />
    </PageWrapper>
  ),
});

const adminQuizzesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/quizzes",
  component: () => (
    <PageWrapper requiredRole="admin">
      <AdminQuizzes />
    </PageWrapper>
  ),
});

const adminNotesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/notes",
  component: () => (
    <PageWrapper requiredRole="admin">
      <AdminNotes />
    </PageWrapper>
  ),
});

const adminAssignmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/assignments",
  component: () => (
    <PageWrapper requiredRole="admin">
      <AdminAssignments />
    </PageWrapper>
  ),
});

const adminStudentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/students",
  component: () => (
    <PageWrapper requiredRole="admin">
      <AdminStudents />
    </PageWrapper>
  ),
});

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/analytics",
  component: () => (
    <PageWrapper requiredRole="admin">
      <AdminAnalytics />
    </PageWrapper>
  ),
});

const adminAnnouncementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/announcements",
  component: () => (
    <PageWrapper requiredRole="admin">
      <AdminAnnouncements />
    </PageWrapper>
  ),
});

const adminSchedulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/schedules",
  component: () => (
    <PageWrapper requiredRole="admin">
      <AdminSchedules />
    </PageWrapper>
  ),
});

// ─── Student ─────────────────────────────────────────────────────────────────
const studentDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/dashboard",
  component: () => (
    <PageWrapper requiredRole="student">
      <StudentDashboard />
    </PageWrapper>
  ),
});

const studentCoursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/courses",
  component: () => (
    <PageWrapper requiredRole="student">
      <StudentCourses />
    </PageWrapper>
  ),
});

const studentLessonsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/courses/$courseId",
  component: () => {
    const { courseId } = studentLessonsRoute.useParams();
    return (
      <PageWrapper requiredRole="student">
        <StudentLessons courseId={courseId} />
      </PageWrapper>
    );
  },
});

const studentQuizzesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/quizzes",
  component: () => (
    <PageWrapper requiredRole="student">
      <StudentQuizzes />
    </PageWrapper>
  ),
});

const studentNotesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/notes",
  component: () => (
    <PageWrapper requiredRole="student">
      <StudentNotes />
    </PageWrapper>
  ),
});

const studentAssignmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/assignments",
  component: () => (
    <PageWrapper requiredRole="student">
      <StudentAssignments />
    </PageWrapper>
  ),
});

const studentScoresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/scores",
  component: () => (
    <PageWrapper requiredRole="student">
      <StudentScores />
    </PageWrapper>
  ),
});

const studentNotificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/notifications",
  component: () => (
    <PageWrapper requiredRole="student">
      <StudentNotifications />
    </PageWrapper>
  ),
});

const studentProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/profile",
  component: () => (
    <PageWrapper requiredRole="student">
      <StudentProfile />
    </PageWrapper>
  ),
});

const studentScheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/schedule",
  component: () => (
    <PageWrapper requiredRole="student">
      <StudentSchedule />
    </PageWrapper>
  ),
});

// ─── Router ───────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  // Admin
  adminDashboardRoute,
  adminCoursesRoute,
  adminQuizzesRoute,
  adminNotesRoute,
  adminAssignmentsRoute,
  adminStudentsRoute,
  adminAnalyticsRoute,
  adminAnnouncementsRoute,
  adminSchedulesRoute,
  // Student
  studentDashboardRoute,
  studentCoursesRoute,
  studentLessonsRoute,
  studentQuizzesRoute,
  studentNotesRoute,
  studentAssignmentsRoute,
  studentScoresRoute,
  studentNotificationsRoute,
  studentProfileRoute,
  studentScheduleRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
