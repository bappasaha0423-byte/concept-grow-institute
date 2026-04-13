import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";

import UserTypes "types/users";
import CourseTypes "types/courses";
import QuizTypes "types/quizzes";
import NoteTypes "types/notes";
import AssignmentTypes "types/assignments";
import AnnouncementTypes "types/announcements";
import ScheduleTypes "types/schedules";
import Common "types/common";

import UsersApi "mixins/users-api";
import CoursesApi "mixins/courses-api";
import QuizzesApi "mixins/quizzes-api";
import NotesApi "mixins/notes-api";
import AssignmentsApi "mixins/assignments-api";
import AnnouncementsApi "mixins/announcements-api";
import PerformanceApi "mixins/performance-api";
import SchedulesApi "mixins/schedules-api";
import Schedules "lib/Schedules";

actor {
  // ── Users ──────────────────────────────────────────────────
  let users = List.empty<UserTypes.UserProfile>();
  let _userIdCounter = { var v : Nat = 0 };

  // ── Courses ────────────────────────────────────────────────
  let courses = List.empty<CourseTypes.Course>();
  let nextCourseId = { var v : Nat = 0 };

  let lessons = List.empty<CourseTypes.Lesson>();
  let nextLessonId = { var v : Nat = 0 };

  let enrollments = List.empty<CourseTypes.Enrollment>();
  let completions = List.empty<CourseTypes.LessonCompletion>();

  // ── Quizzes ────────────────────────────────────────────────
  let quizzes = List.empty<QuizTypes.Quiz>();
  let nextQuizId = { var v : Nat = 0 };

  let questions = List.empty<QuizTypes.Question>();
  let nextQuestionId = { var v : Nat = 0 };

  let attempts = List.empty<QuizTypes.QuizAttempt>();
  let nextAttemptId = { var v : Nat = 0 };

  // ── Notes ──────────────────────────────────────────────────
  let notes = List.empty<NoteTypes.Note>();
  let nextNoteId = { var v : Nat = 0 };

  // ── Assignments ────────────────────────────────────────────
  let assignments = List.empty<AssignmentTypes.Assignment>();
  let nextAssignmentId = { var v : Nat = 0 };

  // ── Announcements ──────────────────────────────────────────
  let announcements = List.empty<AnnouncementTypes.Announcement>();
  let readMap = Map.empty<Common.UserId, Set.Set<Common.AnnouncementId>>();
  let nextAnnouncementId = { var v : Nat = 0 };

  // ── Schedules ──────────────────────────────────────────────
  let scheduleSlots = List.empty<ScheduleTypes.ScheduleSlot>();
  let nextSlotId = { var v : Nat = 0 };
  Schedules.seedClass12(scheduleSlots, nextSlotId, 0);

  // ── Mixins ─────────────────────────────────────────────────
  include UsersApi(users, _userIdCounter);

  include CoursesApi(
    users,
    courses,
    lessons,
    enrollments,
    completions,
    nextCourseId,
    nextLessonId,
  );

  include QuizzesApi(
    users,
    quizzes,
    questions,
    attempts,
    nextQuizId,
    nextQuestionId,
    nextAttemptId,
  );

  include NotesApi(users, notes, nextNoteId);

  include AssignmentsApi(users, assignments, nextAssignmentId);

  include AnnouncementsApi(
    users,
    announcements,
    readMap,
    nextAnnouncementId,
  );

  include PerformanceApi(users, enrollments, completions, attempts);

  include SchedulesApi(users, scheduleSlots, nextSlotId);
};
