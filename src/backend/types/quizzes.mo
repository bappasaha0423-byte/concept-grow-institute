import Common "common";

module {
  public type QuizId = Common.QuizId;
  public type QuestionId = Common.QuestionId;
  public type CourseId = Common.CourseId;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type Question = {
    id : QuestionId;
    quizId : QuizId;
    var text : Text;
    var options : [Text];   // multiple-choice options
    var answerIndex : Nat;  // correct option index
  };

  public type QuestionPublic = {
    id : QuestionId;
    quizId : QuizId;
    text : Text;
    options : [Text];
  };

  public type QuestionWithAnswer = {
    id : QuestionId;
    quizId : QuizId;
    text : Text;
    options : [Text];
    answerIndex : Nat;
  };

  public type Quiz = {
    id : QuizId;
    courseId : CourseId;
    var title : Text;
    var description : Text;
    createdBy : UserId;
    var createdAt : Timestamp;
  };

  public type QuizPublic = {
    id : QuizId;
    courseId : CourseId;
    title : Text;
    description : Text;
    createdBy : UserId;
    createdAt : Timestamp;
  };

  public type QuizAttempt = {
    id : Nat;
    quizId : QuizId;
    studentId : UserId;
    answers : [Nat];   // student's chosen option per question
    score : Nat;
    total : Nat;
    submittedAt : Timestamp;
  };
};
