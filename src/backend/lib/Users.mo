import Types "../types/users";
import Common "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public type UserProfile = Types.UserProfile;
  public type UserProfilePublic = Types.UserProfilePublic;

  public func new(id : Common.UserId, name : Text, role : Common.Role, createdAt : Common.Timestamp) : UserProfile {
    { id; var name; var role; var createdAt }
  };

  public func toPublic(self : UserProfile) : UserProfilePublic {
    { id = self.id; name = self.name; role = self.role; createdAt = self.createdAt }
  };

  public func getProfile(users : List.List<UserProfile>, id : Common.UserId) : ?UserProfilePublic {
    switch (users.find(func(u : UserProfile) : Bool { u.id == id })) {
      case (?u) ?toPublic(u);
      case null null;
    }
  };

  public func isAdmin(users : List.List<UserProfile>, id : Common.UserId) : Bool {
    switch (users.find(func(u : UserProfile) : Bool { u.id == id })) {
      case (?u) u.role == #admin;
      case null false;
    }
  };

  public func listAll(users : List.List<UserProfile>) : [UserProfilePublic] {
    users.map<UserProfile, UserProfilePublic>(func(u) { toPublic(u) }).toArray()
  };
};
