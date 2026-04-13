import Types "../types/notes";
import Common "../types/common";
import List "mo:core/List";

module {
  public func newNote(
    id : Common.NoteId,
    courseId : ?Common.CourseId,
    createdBy : Common.UserId,
    title : Text,
    content : Text,
    now : Common.Timestamp,
  ) : Types.Note {
    { id; var courseId; createdBy; var title; var content; var createdAt = now; var updatedAt = now }
  };

  public func noteToPublic(n : Types.Note) : Types.NotePublic {
    { id = n.id; courseId = n.courseId; createdBy = n.createdBy; title = n.title; content = n.content; createdAt = n.createdAt; updatedAt = n.updatedAt }
  };

  public func listNotes(notes : List.List<Types.Note>, courseId : ?Common.CourseId) : [Types.NotePublic] {
    let filtered = switch (courseId) {
      case null notes;
      case (?cid) notes.filter(func(n : Types.Note) : Bool {
        switch (n.courseId) { case (?nc) nc == cid; case null false }
      });
    };
    filtered.map<Types.Note, Types.NotePublic>(func(n) { noteToPublic(n) }).toArray()
  };

  public func getNote(notes : List.List<Types.Note>, id : Common.NoteId) : ?Types.NotePublic {
    switch (notes.find(func(n : Types.Note) : Bool { n.id == id })) {
      case (?n) ?noteToPublic(n);
      case null null;
    }
  };

  public func updateNote(
    notes : List.List<Types.Note>,
    id : Common.NoteId,
    title : ?Text,
    content : ?Text,
    now : Common.Timestamp,
  ) : Bool {
    switch (notes.find(func(n : Types.Note) : Bool { n.id == id })) {
      case null false;
      case (?n) {
        switch (title) { case (?t) n.title := t; case null () };
        switch (content) { case (?c) n.content := c; case null () };
        n.updatedAt := now;
        true
      };
    }
  };

  public func deleteNote(notes : List.List<Types.Note>, id : Common.NoteId) : Bool {
    let before = notes.size();
    let filtered = notes.filter(func(n : Types.Note) : Bool { n.id != id });
    if (filtered.size() < before) {
      notes.clear();
      notes.append(filtered);
      true
    } else {
      false
    }
  };
};
