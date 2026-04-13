import Common "common";

module {
  public type UserId = Common.UserId;

  public type StudentPerformance = {
    studentId : UserId;
    studentName : Text;
    totalEnrollments : Nat;
    completedLessons : Nat;
    quizzesTaken : Nat;
    averageQuizScore : Float;
  };
};
