import Common "common";

module {
  public type ScheduleId = Nat;

  public type ScheduleSlot = {
    id : ScheduleId;
    var className : Text;
    var day : Text;
    var timeSlot : Text;
    var timeRange : Text;
    var subject : Text;
    var teacher : Text;
    var isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type ScheduleSlotPublic = {
    id : ScheduleId;
    className : Text;
    day : Text;
    timeSlot : Text;
    timeRange : Text;
    subject : Text;
    teacher : Text;
    isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type ScheduleInput = {
    className : Text;
    day : Text;
    timeSlot : Text;
    timeRange : Text;
    subject : Text;
    teacher : Text;
  };
};
