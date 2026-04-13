import UserTypes "../types/users";
import PerfTypes "../types/performance";
import CourseTypes "../types/courses";
import QuizTypes "../types/quizzes";
import Users "../lib/Users";
import Performance "../lib/Performance";
import List "mo:core/List";

mixin (
  users : List.List<UserTypes.UserProfile>,
  enrollments : List.List<CourseTypes.Enrollment>,
  completions : List.List<CourseTypes.LessonCompletion>,
  attempts : List.List<QuizTypes.QuizAttempt>,
) {
  // Admin: aggregate stats (total students, enrollments)
  public shared query ({ caller }) func getAdminStats() : async { totalStudents : Nat; totalEnrollments : Nat } {
    if (not Users.isAdmin(users, caller)) return { totalStudents = 0; totalEnrollments = 0 };
    {
      totalStudents = Performance.totalStudentCount(users);
      totalEnrollments = Performance.totalEnrollmentCount(enrollments);
    }
  };

  // Admin: all student performance summaries
  public shared query ({ caller }) func listStudentPerformances() : async [PerfTypes.StudentPerformance] {
    if (not Users.isAdmin(users, caller)) return [];
    Performance.allStudentPerformances(users, enrollments, completions, attempts)
  };

  // Student: own performance summary
  public shared query ({ caller }) func getMyPerformance() : async ?PerfTypes.StudentPerformance {
    switch (users.find(func(u : UserTypes.UserProfile) : Bool { u.id == caller })) {
      case null null;
      case (?user) ?Performance.buildStudentPerformance(user, enrollments, completions, attempts);
    }
  };
};
