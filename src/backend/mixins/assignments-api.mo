import UserTypes "../types/users";
import AssignmentTypes "../types/assignments";
import Common "../types/common";
import Users "../lib/Users";
import Assignments "../lib/Assignments";
import List "mo:core/List";
import Time "mo:core/Time";

mixin (
  users : List.List<UserTypes.UserProfile>,
  assignments : List.List<AssignmentTypes.Assignment>,
  nextAssignmentId : { var v : Nat },
) {
  public shared query func listAssignments(courseId : ?Common.CourseId) : async [AssignmentTypes.AssignmentPublic] {
    Assignments.listAssignments(assignments, courseId)
  };

  public shared query func getAssignment(id : Common.AssignmentId) : async ?AssignmentTypes.AssignmentPublic {
    Assignments.getAssignment(assignments, id)
  };

  public shared ({ caller }) func createAssignment(
    courseId : ?Common.CourseId,
    title : Text,
    description : Text,
    dueDate : ?Common.Timestamp,
    maxPoints : Nat,
  ) : async Common.Result<AssignmentTypes.AssignmentPublic> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    let id = nextAssignmentId.v;
    nextAssignmentId.v += 1;
    let a = Assignments.newAssignment(id, courseId, caller, title, description, dueDate, maxPoints, Time.now());
    assignments.add(a);
    #ok(Assignments.assignmentToPublic(a))
  };

  public shared ({ caller }) func updateAssignment(
    id : Common.AssignmentId,
    title : ?Text,
    description : ?Text,
    dueDate : ?Common.Timestamp,
    maxPoints : ?Nat,
  ) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Assignments.updateAssignment(assignments, id, title, description, dueDate, maxPoints)) #ok(true)
    else #err("Assignment not found")
  };

  public shared ({ caller }) func deleteAssignment(id : Common.AssignmentId) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Assignments.deleteAssignment(assignments, id)) #ok(true)
    else #err("Assignment not found")
  };
};
