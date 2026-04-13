import Types "../types/assignments";
import Common "../types/common";
import List "mo:core/List";

module {
  public func newAssignment(
    id : Common.AssignmentId,
    courseId : ?Common.CourseId,
    createdBy : Common.UserId,
    title : Text,
    description : Text,
    dueDate : ?Common.Timestamp,
    maxPoints : Nat,
    now : Common.Timestamp,
  ) : Types.Assignment {
    { id; var courseId; createdBy; var title; var description; var dueDate; var maxPoints; var createdAt = now }
  };

  public func assignmentToPublic(a : Types.Assignment) : Types.AssignmentPublic {
    { id = a.id; courseId = a.courseId; createdBy = a.createdBy; title = a.title; description = a.description; dueDate = a.dueDate; maxPoints = a.maxPoints; createdAt = a.createdAt }
  };

  public func listAssignments(assignments : List.List<Types.Assignment>, courseId : ?Common.CourseId) : [Types.AssignmentPublic] {
    let filtered = switch (courseId) {
      case null assignments;
      case (?cid) assignments.filter(func(a : Types.Assignment) : Bool {
        switch (a.courseId) { case (?ac) ac == cid; case null false }
      });
    };
    filtered.map<Types.Assignment, Types.AssignmentPublic>(func(a) { assignmentToPublic(a) }).toArray()
  };

  public func getAssignment(assignments : List.List<Types.Assignment>, id : Common.AssignmentId) : ?Types.AssignmentPublic {
    switch (assignments.find(func(a : Types.Assignment) : Bool { a.id == id })) {
      case (?a) ?assignmentToPublic(a);
      case null null;
    }
  };

  public func updateAssignment(
    assignments : List.List<Types.Assignment>,
    id : Common.AssignmentId,
    title : ?Text,
    description : ?Text,
    dueDate : ?Common.Timestamp,
    maxPoints : ?Nat,
  ) : Bool {
    switch (assignments.find(func(a : Types.Assignment) : Bool { a.id == id })) {
      case null false;
      case (?a) {
        switch (title) { case (?t) a.title := t; case null () };
        switch (description) { case (?d) a.description := d; case null () };
        switch (dueDate) { case (?dd) a.dueDate := ?dd; case null () };
        switch (maxPoints) { case (?mp) a.maxPoints := mp; case null () };
        true
      };
    }
  };

  public func deleteAssignment(assignments : List.List<Types.Assignment>, id : Common.AssignmentId) : Bool {
    let before = assignments.size();
    let filtered = assignments.filter(func(a : Types.Assignment) : Bool { a.id != id });
    if (filtered.size() < before) {
      assignments.clear();
      assignments.append(filtered);
      true
    } else {
      false
    }
  };
};
