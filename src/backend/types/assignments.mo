import Common "common";

module {
  public type AssignmentId = Common.AssignmentId;
  public type CourseId = Common.CourseId;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type Assignment = {
    id : AssignmentId;
    var courseId : ?CourseId;
    createdBy : UserId;
    var title : Text;
    var description : Text;
    var dueDate : ?Timestamp;
    var maxPoints : Nat;
    var createdAt : Timestamp;
  };

  public type AssignmentPublic = {
    id : AssignmentId;
    courseId : ?CourseId;
    createdBy : UserId;
    title : Text;
    description : Text;
    dueDate : ?Timestamp;
    maxPoints : Nat;
    createdAt : Timestamp;
  };
};
