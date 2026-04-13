import UserTypes "../types/users";
import NoteTypes "../types/notes";
import Common "../types/common";
import Users "../lib/Users";
import Notes "../lib/Notes";
import List "mo:core/List";
import Time "mo:core/Time";

mixin (
  users : List.List<UserTypes.UserProfile>,
  notes : List.List<NoteTypes.Note>,
  nextNoteId : { var v : Nat },
) {
  public shared query func listNotes(courseId : ?Common.CourseId) : async [NoteTypes.NotePublic] {
    Notes.listNotes(notes, courseId)
  };

  public shared query func getNote(id : Common.NoteId) : async ?NoteTypes.NotePublic {
    Notes.getNote(notes, id)
  };

  public shared ({ caller }) func createNote(
    courseId : ?Common.CourseId,
    title : Text,
    content : Text,
  ) : async Common.Result<NoteTypes.NotePublic> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    let id = nextNoteId.v;
    nextNoteId.v += 1;
    let note = Notes.newNote(id, courseId, caller, title, content, Time.now());
    notes.add(note);
    #ok(Notes.noteToPublic(note))
  };

  public shared ({ caller }) func updateNote(
    id : Common.NoteId,
    title : ?Text,
    content : ?Text,
  ) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Notes.updateNote(notes, id, title, content, Time.now())) #ok(true)
    else #err("Note not found")
  };

  public shared ({ caller }) func deleteNote(id : Common.NoteId) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Notes.deleteNote(notes, id)) #ok(true)
    else #err("Note not found")
  };
};
