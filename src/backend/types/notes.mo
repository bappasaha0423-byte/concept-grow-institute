import Common "common";

module {
  public type NoteId = Common.NoteId;
  public type CourseId = Common.CourseId;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type Note = {
    id : NoteId;
    var courseId : ?CourseId;
    createdBy : UserId;
    var title : Text;
    var content : Text;
    var createdAt : Timestamp;
    var updatedAt : Timestamp;
  };

  public type NotePublic = {
    id : NoteId;
    courseId : ?CourseId;
    createdBy : UserId;
    title : Text;
    content : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };
};
