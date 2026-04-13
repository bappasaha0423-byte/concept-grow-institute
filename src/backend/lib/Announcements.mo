import Types "../types/announcements";
import Common "../types/common";
import List "mo:core/List";
import Set "mo:core/Set";
import Map "mo:core/Map";

module {
  public func newAnnouncement(
    id : Common.AnnouncementId,
    createdBy : Common.UserId,
    title : Text,
    message : Text,
    now : Common.Timestamp,
  ) : Types.Announcement {
    { id; createdBy; var title; var message; var createdAt = now }
  };

  public func announcementToPublic(
    a : Types.Announcement,
    readSet : Set.Set<Common.AnnouncementId>,
  ) : Types.AnnouncementPublic {
    {
      id = a.id;
      createdBy = a.createdBy;
      title = a.title;
      message = a.message;
      createdAt = a.createdAt;
      isRead = readSet.contains(a.id);
    }
  };

  public func listAnnouncements(
    announcements : List.List<Types.Announcement>,
    readMap : Map.Map<Common.UserId, Set.Set<Common.AnnouncementId>>,
    studentId : Common.UserId,
  ) : [Types.AnnouncementPublic] {
    let readSet = switch (readMap.get(studentId)) {
      case (?s) s;
      case null Set.empty<Common.AnnouncementId>();
    };
    announcements.map<Types.Announcement, Types.AnnouncementPublic>(func(a) {
      announcementToPublic(a, readSet)
    }).toArray()
  };

  public func markRead(
    readMap : Map.Map<Common.UserId, Set.Set<Common.AnnouncementId>>,
    studentId : Common.UserId,
    announcementId : Common.AnnouncementId,
  ) : () {
    let readSet = switch (readMap.get(studentId)) {
      case (?s) s;
      case null {
        let s = Set.empty<Common.AnnouncementId>();
        readMap.add(studentId, s);
        s
      };
    };
    readSet.add(announcementId);
  };

  public func updateAnnouncement(
    announcements : List.List<Types.Announcement>,
    id : Common.AnnouncementId,
    title : ?Text,
    message : ?Text,
  ) : Bool {
    switch (announcements.find(func(a : Types.Announcement) : Bool { a.id == id })) {
      case null false;
      case (?a) {
        switch (title) { case (?t) a.title := t; case null () };
        switch (message) { case (?m) a.message := m; case null () };
        true
      };
    }
  };

  public func deleteAnnouncement(announcements : List.List<Types.Announcement>, id : Common.AnnouncementId) : Bool {
    let before = announcements.size();
    let filtered = announcements.filter(func(a : Types.Announcement) : Bool { a.id != id });
    if (filtered.size() < before) {
      announcements.clear();
      announcements.append(filtered);
      true
    } else {
      false
    }
  };
};
