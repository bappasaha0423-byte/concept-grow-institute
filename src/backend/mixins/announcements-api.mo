import UserTypes "../types/users";
import AnnouncementTypes "../types/announcements";
import Common "../types/common";
import Users "../lib/Users";
import Announcements "../lib/Announcements";
import List "mo:core/List";
import Set "mo:core/Set";
import Map "mo:core/Map";
import Time "mo:core/Time";

mixin (
  users : List.List<UserTypes.UserProfile>,
  announcements : List.List<AnnouncementTypes.Announcement>,
  readMap : Map.Map<Common.UserId, Set.Set<Common.AnnouncementId>>,
  nextAnnouncementId : { var v : Nat },
) {
  // Admin: create announcement
  public shared ({ caller }) func createAnnouncement(
    title : Text,
    message : Text,
  ) : async Common.Result<AnnouncementTypes.AnnouncementPublic> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    let id = nextAnnouncementId.v;
    nextAnnouncementId.v += 1;
    let a = Announcements.newAnnouncement(id, caller, title, message, Time.now());
    announcements.add(a);
    let emptySet = Set.empty<Common.AnnouncementId>();
    #ok(Announcements.announcementToPublic(a, emptySet))
  };

  public shared ({ caller }) func updateAnnouncement(
    id : Common.AnnouncementId,
    title : ?Text,
    message : ?Text,
  ) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Announcements.updateAnnouncement(announcements, id, title, message)) #ok(true)
    else #err("Announcement not found")
  };

  public shared ({ caller }) func deleteAnnouncement(id : Common.AnnouncementId) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Announcements.deleteAnnouncement(announcements, id)) #ok(true)
    else #err("Announcement not found")
  };

  // Student: fetch all announcements with read status
  public shared query ({ caller }) func listAnnouncements() : async [AnnouncementTypes.AnnouncementPublic] {
    Announcements.listAnnouncements(announcements, readMap, caller)
  };

  // Student: mark an announcement as read
  public shared ({ caller }) func markAnnouncementRead(id : Common.AnnouncementId) : async Common.Result<Bool> {
    switch (users.find(func(u : UserTypes.UserProfile) : Bool { u.id == caller })) {
      case null return #err("Not registered");
      case (?_) ();
    };
    Announcements.markRead(readMap, caller, id);
    #ok(true)
  };
};
