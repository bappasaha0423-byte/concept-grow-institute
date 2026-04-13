import Types "../types/schedules";
import Common "../types/common";
import List "mo:core/List";

module {
  public func newSlot(
    id : Types.ScheduleId,
    input : Types.ScheduleInput,
    createdAt : Common.Timestamp,
  ) : Types.ScheduleSlot {
    {
      id;
      var className = input.className;
      var day = input.day;
      var timeSlot = input.timeSlot;
      var timeRange = input.timeRange;
      var subject = input.subject;
      var teacher = input.teacher;
      var isActive = true;
      createdAt;
    }
  };

  public func toPublic(s : Types.ScheduleSlot) : Types.ScheduleSlotPublic {
    {
      id = s.id;
      className = s.className;
      day = s.day;
      timeSlot = s.timeSlot;
      timeRange = s.timeRange;
      subject = s.subject;
      teacher = s.teacher;
      isActive = s.isActive;
      createdAt = s.createdAt;
    }
  };

  public func listAll(slots : List.List<Types.ScheduleSlot>) : [Types.ScheduleSlotPublic] {
    slots.map<Types.ScheduleSlot, Types.ScheduleSlotPublic>(func(s) { toPublic(s) }).toArray()
  };

  public func listByClass(slots : List.List<Types.ScheduleSlot>, className : Text) : [Types.ScheduleSlotPublic] {
    slots.filter(func(s : Types.ScheduleSlot) : Bool { s.className == className })
         .map<Types.ScheduleSlot, Types.ScheduleSlotPublic>(func(s) { toPublic(s) })
         .toArray()
  };

  public func update(
    slots : List.List<Types.ScheduleSlot>,
    id : Types.ScheduleId,
    input : Types.ScheduleInput,
  ) : Bool {
    switch (slots.find(func(s : Types.ScheduleSlot) : Bool { s.id == id })) {
      case null false;
      case (?s) {
        s.className := input.className;
        s.day := input.day;
        s.timeSlot := input.timeSlot;
        s.timeRange := input.timeRange;
        s.subject := input.subject;
        s.teacher := input.teacher;
        true
      };
    }
  };

  public func delete(slots : List.List<Types.ScheduleSlot>, id : Types.ScheduleId) : Bool {
    let before = slots.size();
    let filtered = slots.filter(func(s : Types.ScheduleSlot) : Bool { s.id != id });
    if (filtered.size() < before) {
      slots.clear();
      slots.append(filtered);
      true
    } else {
      false
    }
  };

  // Pre-populate Class 12 sample schedule data
  public func seedClass12(slots : List.List<Types.ScheduleSlot>, nextId : { var v : Nat }, createdAt : Common.Timestamp) {
    let samples : [(Text, Text, Text, Text, Text)] = [
      // (day, timeSlot, timeRange, subject, teacher)
      ("Tuesday",   "Morning",   "7-10AM",       "Chemistry", "AH"),
      ("Tuesday",   "Morning",   "7-10AM",       "Biology",   "SR"),
      ("Wednesday", "Morning",   "7-10AM",       "Math",      "AI"),
      ("Wednesday", "Morning",   "7-10AM",       "English",   ""),
      ("Thursday",  "Morning",   "7-10AM",       "Physics",   "SK"),
      ("Thursday",  "Morning",   "7-10AM",       "Math",      "AI"),
      ("Friday",    "Morning",   "7-10AM",       "Physics",   "HA"),
      ("Friday",    "Morning",   "7-10AM",       "English",   ""),
      ("Saturday",  "Morning",   "7-10AM",       "Biology",   "SI"),
      ("Saturday",  "Morning",   "7-10AM",       "Bengali",   ""),
      ("Saturday",  "Evening",   "2-5:30PM",     "Chemistry", "JR"),
      ("Saturday",  "Evening",   "2-5:30PM",     "Math",      "SS"),
      ("Sunday",    "Afternoon", "10:30AM-4PM",  "Chemistry", "JR"),
      ("Sunday",    "Afternoon", "10:30AM-4PM",  "Physics",   "SK"),
      ("Sunday",    "Afternoon", "10:30AM-4PM",  "Biology",   "SR"),
      ("Sunday",    "Afternoon", "10:30AM-4PM",  "Bengali",   ""),
    ];
    for ((day, timeSlot, timeRange, subject, teacher) in samples.values()) {
      let slot = newSlot(
        nextId.v,
        { className = "Class 12"; day; timeSlot; timeRange; subject; teacher },
        createdAt,
      );
      slots.add(slot);
      nextId.v += 1;
    };
  };
};
