import Common "common";

module {
  public type CourseId = Common.CourseId;
  public type LessonId = Common.LessonId;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type Course = {
    id : CourseId;
    var title : Text;
    var description : Text;
    var category : Text;
    var published : Bool;
    createdBy : UserId;
    var createdAt : Timestamp;
  };

  public type CoursePublic = {
    id : CourseId;
    title : Text;
    description : Text;
    category : Text;
    published : Bool;
    createdBy : UserId;
    createdAt : Timestamp;
  };

  public type Lesson = {
    id : LessonId;
    courseId : CourseId;
    var title : Text;
    var content : Text;
    var order : Nat;
    var createdAt : Timestamp;
  };

  public type LessonPublic = {
    id : LessonId;
    courseId : CourseId;
    title : Text;
    content : Text;
    order : Nat;
    createdAt : Timestamp;
  };

  // enrollment + lesson completion tracking (internal)
  public type Enrollment = {
    studentId : UserId;
    courseId : CourseId;
    enrolledAt : Timestamp;
  };

  public type LessonCompletion = {
    studentId : UserId;
    lessonId : LessonId;
    completedAt : Timestamp;
  };
};
