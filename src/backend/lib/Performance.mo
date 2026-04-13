import UserTypes "../types/users";
import PerfTypes "../types/performance";
import CourseTypes "../types/courses";
import QuizTypes "../types/quizzes";
import Common "../types/common";
import List "mo:core/List";

module {
  public func buildStudentPerformance(
    user : UserTypes.UserProfile,
    enrollments : List.List<CourseTypes.Enrollment>,
    completions : List.List<CourseTypes.LessonCompletion>,
    attempts : List.List<QuizTypes.QuizAttempt>,
  ) : PerfTypes.StudentPerformance {
    let studentId = user.id;
    let totalEnrollments = enrollments.filter(func(e : CourseTypes.Enrollment) : Bool { e.studentId == studentId }).size();
    let completedLessons = completions.filter(func(c : CourseTypes.LessonCompletion) : Bool { c.studentId == studentId }).size();
    let studentAttempts = attempts.filter(func(a : QuizTypes.QuizAttempt) : Bool { a.studentId == studentId }).toArray();
    let quizzesTaken = studentAttempts.size();
    var totalPct : Float = 0.0;
    for (a in studentAttempts.values()) {
      if (a.total > 0) {
        totalPct += (a.score.toFloat() / a.total.toFloat()) * 100.0;
      };
    };
    let averageQuizScore = if (quizzesTaken == 0) 0.0 else totalPct / quizzesTaken.toFloat();
    {
      studentId;
      studentName = user.name;
      totalEnrollments;
      completedLessons;
      quizzesTaken;
      averageQuizScore;
    }
  };

  public func allStudentPerformances(
    users : List.List<UserTypes.UserProfile>,
    enrollments : List.List<CourseTypes.Enrollment>,
    completions : List.List<CourseTypes.LessonCompletion>,
    attempts : List.List<QuizTypes.QuizAttempt>,
  ) : [PerfTypes.StudentPerformance] {
    users.filter(func(u : UserTypes.UserProfile) : Bool { u.role == #student })
         .map<UserTypes.UserProfile, PerfTypes.StudentPerformance>(func(u) {
           buildStudentPerformance(u, enrollments, completions, attempts)
         })
         .toArray()
  };

  public func totalStudentCount(users : List.List<UserTypes.UserProfile>) : Nat {
    users.filter(func(u : UserTypes.UserProfile) : Bool { u.role == #student }).size()
  };

  public func totalEnrollmentCount(enrollments : List.List<CourseTypes.Enrollment>) : Nat {
    enrollments.size()
  };
};
