import Types "../types/users";
import Common "../types/common";
import Users "../lib/Users";
import List "mo:core/List";
import Time "mo:core/Time";

mixin (users : List.List<Types.UserProfile>, nextId : { var v : Nat }) {

  // Register caller with a name; role defaults to #student unless first user (admin)
  public shared ({ caller }) func register(name : Text) : async Common.Result<Types.UserProfilePublic> {
    switch (users.find(func(u : Types.UserProfile) : Bool { u.id == caller })) {
      case (?_) return #err("Already registered");
      case null ();
    };
    let role : Common.Role = if (users.size() == 0) #admin else #student;
    let user = Users.new(caller, name, role, Time.now());
    users.add(user);
    #ok(user.toPublic())
  };

  // Register caller explicitly as admin (must be called by an existing admin or first user)
  public shared ({ caller }) func registerAsAdmin(name : Text) : async Common.Result<Types.UserProfilePublic> {
    switch (users.find(func(u : Types.UserProfile) : Bool { u.id == caller })) {
      case (?_) return #err("Already registered");
      case null ();
    };
    if (users.size() > 0 and not Users.isAdmin(users, caller)) {
      return #err("Unauthorized: only admins can create admin accounts");
    };
    let user = Users.new(caller, name, #admin, Time.now());
    users.add(user);
    #ok(user.toPublic())
  };

  // Fetch the calling user's profile
  public shared query ({ caller }) func getMyProfile() : async ?Types.UserProfilePublic {
    Users.getProfile(users, caller)
  };

  // Admin: list all users
  public shared query ({ caller }) func listUsers() : async [Types.UserProfilePublic] {
    if (not Users.isAdmin(users, caller)) return [];
    Users.listAll(users)
  };
};
