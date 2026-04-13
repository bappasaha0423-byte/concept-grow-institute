import Types "../types/quizzes";
import Common "../types/common";
import List "mo:core/List";

module {
  // ── Quizzes ───────────────────────────────────────────────
  public func newQuiz(
    id : Common.QuizId,
    courseId : Common.CourseId,
    title : Text,
    description : Text,
    createdBy : Common.UserId,
    createdAt : Common.Timestamp,
  ) : Types.Quiz {
    { id; courseId; var title; var description; createdBy; var createdAt }
  };

  public func quizToPublic(q : Types.Quiz) : Types.QuizPublic {
    { id = q.id; courseId = q.courseId; title = q.title; description = q.description; createdBy = q.createdBy; createdAt = q.createdAt }
  };

  public func listQuizzes(quizzes : List.List<Types.Quiz>, courseId : Common.CourseId) : [Types.QuizPublic] {
    quizzes.filter(func(q : Types.Quiz) : Bool { q.courseId == courseId })
           .map<Types.Quiz, Types.QuizPublic>(func(q) { quizToPublic(q) })
           .toArray()
  };

  public func getQuiz(quizzes : List.List<Types.Quiz>, id : Common.QuizId) : ?Types.QuizPublic {
    switch (quizzes.find(func(q : Types.Quiz) : Bool { q.id == id })) {
      case (?q) ?quizToPublic(q);
      case null null;
    }
  };

  public func updateQuiz(
    quizzes : List.List<Types.Quiz>,
    id : Common.QuizId,
    title : ?Text,
    description : ?Text,
  ) : Bool {
    switch (quizzes.find(func(q : Types.Quiz) : Bool { q.id == id })) {
      case null false;
      case (?q) {
        switch (title) { case (?t) q.title := t; case null () };
        switch (description) { case (?d) q.description := d; case null () };
        true
      };
    }
  };

  public func deleteQuiz(quizzes : List.List<Types.Quiz>, id : Common.QuizId) : Bool {
    let before = quizzes.size();
    let filtered = quizzes.filter(func(q : Types.Quiz) : Bool { q.id != id });
    if (filtered.size() < before) {
      quizzes.clear();
      quizzes.append(filtered);
      true
    } else {
      false
    }
  };

  // ── Questions ─────────────────────────────────────────────
  public func newQuestion(
    id : Common.QuestionId,
    quizId : Common.QuizId,
    text : Text,
    options : [Text],
    answerIndex : Nat,
  ) : Types.Question {
    { id; quizId; var text; var options; var answerIndex }
  };

  public func questionToPublic(q : Types.Question) : Types.QuestionPublic {
    { id = q.id; quizId = q.quizId; text = q.text; options = q.options }
  };

  public func questionWithAnswer(q : Types.Question) : Types.QuestionWithAnswer {
    { id = q.id; quizId = q.quizId; text = q.text; options = q.options; answerIndex = q.answerIndex }
  };

  public func listQuestions(questions : List.List<Types.Question>, quizId : Common.QuizId) : [Types.QuestionPublic] {
    questions.filter(func(q : Types.Question) : Bool { q.quizId == quizId })
             .map<Types.Question, Types.QuestionPublic>(func(q) { questionToPublic(q) })
             .toArray()
  };

  public func listQuestionsWithAnswers(questions : List.List<Types.Question>, quizId : Common.QuizId) : [Types.QuestionWithAnswer] {
    questions.filter(func(q : Types.Question) : Bool { q.quizId == quizId })
             .map<Types.Question, Types.QuestionWithAnswer>(func(q) { questionWithAnswer(q) })
             .toArray()
  };

  public func updateQuestion(
    questions : List.List<Types.Question>,
    id : Common.QuestionId,
    text : ?Text,
    options : ?[Text],
    answerIndex : ?Nat,
  ) : Bool {
    switch (questions.find(func(q : Types.Question) : Bool { q.id == id })) {
      case null false;
      case (?q) {
        switch (text) { case (?t) q.text := t; case null () };
        switch (options) { case (?o) q.options := o; case null () };
        switch (answerIndex) { case (?a) q.answerIndex := a; case null () };
        true
      };
    }
  };

  public func deleteQuestion(questions : List.List<Types.Question>, id : Common.QuestionId) : Bool {
    let before = questions.size();
    let filtered = questions.filter(func(q : Types.Question) : Bool { q.id != id });
    if (filtered.size() < before) {
      questions.clear();
      questions.append(filtered);
      true
    } else {
      false
    }
  };

  // ── Quiz Attempts ─────────────────────────────────────────
  public func submitAttempt(
    attempts : List.List<Types.QuizAttempt>,
    questions : List.List<Types.Question>,
    attemptId : Nat,
    quizId : Common.QuizId,
    studentId : Common.UserId,
    answers : [Nat],
    submittedAt : Common.Timestamp,
  ) : Types.QuizAttempt {
    let quizQs = questions.filter(func(q : Types.Question) : Bool { q.quizId == quizId }).toArray();
    let total = quizQs.size();
    var score : Nat = 0;
    var i : Nat = 0;
    for (q in quizQs.values()) {
      if (i < answers.size() and answers[i] == q.answerIndex) {
        score += 1;
      };
      i += 1;
    };
    let attempt : Types.QuizAttempt = {
      id = attemptId;
      quizId;
      studentId;
      answers;
      score;
      total;
      submittedAt;
    };
    attempts.add(attempt);
    attempt
  };

  public func getAttempts(
    attempts : List.List<Types.QuizAttempt>,
    studentId : Common.UserId,
    quizId : ?Common.QuizId,
  ) : [Types.QuizAttempt] {
    attempts.filter(func(a : Types.QuizAttempt) : Bool {
      if (a.studentId != studentId) return false;
      switch (quizId) {
        case (?qid) a.quizId == qid;
        case null true;
      }
    }).toArray()
  };

  public func averageScore(attempts : List.List<Types.QuizAttempt>, studentId : Common.UserId) : Float {
    let studentAttempts = attempts.filter(func(a : Types.QuizAttempt) : Bool { a.studentId == studentId }).toArray();
    let count = studentAttempts.size();
    if (count == 0) return 0.0;
    var totalPct : Float = 0.0;
    for (a in studentAttempts.values()) {
      if (a.total > 0) {
        totalPct += (a.score.toFloat() / a.total.toFloat()) * 100.0;
      };
    };
    totalPct / count.toFloat()
  };

  public func quizzesTaken(attempts : List.List<Types.QuizAttempt>, studentId : Common.UserId) : Nat {
    attempts.filter(func(a : Types.QuizAttempt) : Bool { a.studentId == studentId }).size()
  };
};
