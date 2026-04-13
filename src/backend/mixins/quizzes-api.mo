import UserTypes "../types/users";
import QuizTypes "../types/quizzes";
import Common "../types/common";
import Users "../lib/Users";
import Quizzes "../lib/Quizzes";
import List "mo:core/List";
import Time "mo:core/Time";

mixin (
  users : List.List<UserTypes.UserProfile>,
  quizzes : List.List<QuizTypes.Quiz>,
  questions : List.List<QuizTypes.Question>,
  attempts : List.List<QuizTypes.QuizAttempt>,
  nextQuizId : { var v : Nat },
  nextQuestionId : { var v : Nat },
  nextAttemptId : { var v : Nat },
) {
  // ── Quizzes ───────────────────────────────────────────────
  public shared query func listQuizzes(courseId : Common.CourseId) : async [QuizTypes.QuizPublic] {
    Quizzes.listQuizzes(quizzes, courseId)
  };

  public shared query func getQuiz(id : Common.QuizId) : async ?QuizTypes.QuizPublic {
    Quizzes.getQuiz(quizzes, id)
  };

  public shared ({ caller }) func createQuiz(
    courseId : Common.CourseId,
    title : Text,
    description : Text,
  ) : async Common.Result<QuizTypes.QuizPublic> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    let id = nextQuizId.v;
    nextQuizId.v += 1;
    let quiz = Quizzes.newQuiz(id, courseId, title, description, caller, Time.now());
    quizzes.add(quiz);
    #ok(Quizzes.quizToPublic(quiz))
  };

  public shared ({ caller }) func updateQuiz(
    id : Common.QuizId,
    title : ?Text,
    description : ?Text,
  ) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Quizzes.updateQuiz(quizzes, id, title, description)) #ok(true)
    else #err("Quiz not found")
  };

  public shared ({ caller }) func deleteQuiz(id : Common.QuizId) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Quizzes.deleteQuiz(quizzes, id)) #ok(true)
    else #err("Quiz not found")
  };

  // ── Questions ─────────────────────────────────────────────
  public shared query func listQuestions(quizId : Common.QuizId) : async [QuizTypes.QuestionPublic] {
    Quizzes.listQuestions(questions, quizId)
  };

  // Admin-only: list questions with answer keys
  public shared ({ caller }) func listQuestionsWithAnswers(quizId : Common.QuizId) : async Common.Result<[QuizTypes.QuestionWithAnswer]> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    #ok(Quizzes.listQuestionsWithAnswers(questions, quizId))
  };

  public shared ({ caller }) func createQuestion(
    quizId : Common.QuizId,
    text : Text,
    options : [Text],
    answerIndex : Nat,
  ) : async Common.Result<QuizTypes.QuestionPublic> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    let id = nextQuestionId.v;
    nextQuestionId.v += 1;
    let q = Quizzes.newQuestion(id, quizId, text, options, answerIndex);
    questions.add(q);
    #ok(Quizzes.questionToPublic(q))
  };

  public shared ({ caller }) func updateQuestion(
    id : Common.QuestionId,
    text : ?Text,
    options : ?[Text],
    answerIndex : ?Nat,
  ) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Quizzes.updateQuestion(questions, id, text, options, answerIndex)) #ok(true)
    else #err("Question not found")
  };

  public shared ({ caller }) func deleteQuestion(id : Common.QuestionId) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Quizzes.deleteQuestion(questions, id)) #ok(true)
    else #err("Question not found")
  };

  // ── Attempts ──────────────────────────────────────────────
  public shared ({ caller }) func submitQuizAttempt(
    quizId : Common.QuizId,
    answers : [Nat],
  ) : async Common.Result<QuizTypes.QuizAttempt> {
    switch (users.find(func(u : UserTypes.UserProfile) : Bool { u.id == caller })) {
      case null return #err("Not registered");
      case (?_) ();
    };
    let id = nextAttemptId.v;
    nextAttemptId.v += 1;
    let attempt = Quizzes.submitAttempt(attempts, questions, id, quizId, caller, answers, Time.now());
    #ok(attempt)
  };

  public shared query ({ caller }) func getMyAttempts(quizId : ?Common.QuizId) : async [QuizTypes.QuizAttempt] {
    Quizzes.getAttempts(attempts, caller, quizId)
  };
};
