module {
  public type UserId = Principal;
  public type Timestamp = Int;
  public type CourseId = Nat;
  public type LessonId = Nat;
  public type QuizId = Nat;
  public type QuestionId = Nat;
  public type NoteId = Nat;
  public type AssignmentId = Nat;
  public type AnnouncementId = Nat;

  public type Role = { #admin; #student };

  public type Result<T> = { #ok : T; #err : Text };
};
