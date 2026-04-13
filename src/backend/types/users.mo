import Common "common";

module {
  public type UserId = Common.UserId;
  public type Role = Common.Role;

  public type UserProfile = {
    id : UserId;
    var name : Text;
    var role : Role;
    var createdAt : Common.Timestamp;
  };

  // Shared (API boundary) version — no var fields
  public type UserProfilePublic = {
    id : UserId;
    name : Text;
    role : Role;
    createdAt : Common.Timestamp;
  };
};
