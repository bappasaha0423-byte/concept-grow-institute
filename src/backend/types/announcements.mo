import Common "common";

module {
  public type AnnouncementId = Common.AnnouncementId;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type Announcement = {
    id : AnnouncementId;
    createdBy : UserId;
    var title : Text;
    var message : Text;
    var createdAt : Timestamp;
  };

  public type AnnouncementPublic = {
    id : AnnouncementId;
    createdBy : UserId;
    title : Text;
    message : Text;
    createdAt : Timestamp;
    isRead : Bool;
  };
};
