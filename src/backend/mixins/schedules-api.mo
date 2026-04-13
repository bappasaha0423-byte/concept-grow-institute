import UserTypes "../types/users";
import ScheduleTypes "../types/schedules";
import Common "../types/common";
import Users "../lib/Users";
import Schedules "../lib/Schedules";
import List "mo:core/List";
import Time "mo:core/Time";

mixin (
  users : List.List<UserTypes.UserProfile>,
  slots : List.List<ScheduleTypes.ScheduleSlot>,
  nextSlotId : { var v : Nat },
) {
  public shared query func listScheduleSlots() : async [ScheduleTypes.ScheduleSlotPublic] {
    Schedules.listAll(slots)
  };

  public shared query func listScheduleSlotsByClass(className : Text) : async [ScheduleTypes.ScheduleSlotPublic] {
    Schedules.listByClass(slots, className)
  };

  public shared ({ caller }) func createScheduleSlot(
    input : ScheduleTypes.ScheduleInput,
  ) : async Common.Result<ScheduleTypes.ScheduleSlotPublic> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    let id = nextSlotId.v;
    nextSlotId.v += 1;
    let slot = Schedules.newSlot(id, input, Time.now());
    slots.add(slot);
    #ok(Schedules.toPublic(slot))
  };

  public shared ({ caller }) func updateScheduleSlot(
    id : ScheduleTypes.ScheduleId,
    input : ScheduleTypes.ScheduleInput,
  ) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Schedules.update(slots, id, input)) #ok(true)
    else #err("Schedule slot not found")
  };

  public shared ({ caller }) func deleteScheduleSlot(id : ScheduleTypes.ScheduleId) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Schedules.delete(slots, id)) #ok(true)
    else #err("Schedule slot not found")
  };
};
