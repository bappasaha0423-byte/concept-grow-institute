import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, CalendarDays, Clock, User } from "lucide-react";
import { useListScheduleSlotsByClass } from "../../hooks/useBackend";
import type { ScheduleSlot } from "../../types/index";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];

const TIME_SLOT_META: Record<
  string,
  { range: string; color: string; bg: string }
> = {
  Morning: {
    range: "7:00 AM – 10:00 AM",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  },
  Afternoon: {
    range: "10:30 AM – 4:00 PM",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800",
  },
  Evening: {
    range: "2:00 PM – 5:30 PM",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800",
  },
};

function SlotCell({ slot }: { slot: ScheduleSlot | undefined }) {
  if (!slot) {
    return (
      <div className="h-full min-h-[80px] rounded-lg border border-dashed border-border flex items-center justify-center">
        <span className="text-xs text-muted-foreground/50">—</span>
      </div>
    );
  }
  const meta = TIME_SLOT_META[slot.timeSlot] ?? TIME_SLOT_META.Morning;
  return (
    <div
      className={`rounded-lg border p-3 space-y-1.5 min-h-[80px] ${meta.bg}`}
    >
      <div className="flex items-start gap-1.5">
        <BookOpen className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${meta.color}`} />
        <p className="font-semibold text-sm text-foreground leading-snug">
          {slot.subject}
        </p>
      </div>
      {slot.teacher && (
        <div className="flex items-center gap-1">
          <User className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">{slot.teacher}</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">{slot.timeRange}</span>
      </div>
    </div>
  );
}

export default function StudentSchedule() {
  const { data: slots, isLoading } = useListScheduleSlotsByClass("Class 12");

  // Build a lookup: day -> timeSlot -> slot
  const slotMap: Record<string, Record<string, ScheduleSlot>> = {};
  if (slots) {
    for (const s of slots) {
      if (!s.isActive) continue;
      if (!slotMap[s.day]) slotMap[s.day] = {};
      slotMap[s.day][s.timeSlot] = s;
    }
  }

  const activeDays = DAYS.filter(
    (d) => slotMap[d] && Object.keys(slotMap[d]).length > 0,
  );
  const displayDays = activeDays.length > 0 ? activeDays : DAYS;

  return (
    <div className="p-6 space-y-6" data-ocid="student-schedule">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Class 12 Routine
          </h1>
          <p className="text-sm text-muted-foreground">
            Your weekly class timetable
          </p>
        </div>
      </div>

      {/* Schedule Image Banner */}
      <div className="rounded-2xl overflow-hidden border border-border shadow-md">
        <img
          src="/assets/schedules/class12-schedule.jpg"
          alt="CONCEPT GROW INSTITUTE — CLASS XI/XII SCHEDULE"
          className="w-full object-contain max-h-[520px] bg-muted/30"
        />
        <div className="bg-card px-5 py-3 border-t border-border">
          <p className="text-sm font-display font-semibold text-foreground">
            CONCEPT GROW INSTITUTE — CLASS XI/XII SCHEDULE
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Where Concepts Grow Into Success | RUN BY L.M EDUCATIONAL TRUST REGD
            NO-1202-00023/19
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3">
        {TIME_SLOTS.map((ts) => {
          const meta = TIME_SLOT_META[ts];
          return (
            <div
              key={ts}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${meta.bg} ${meta.color}`}
            >
              <Clock className="w-3 h-3" />
              <span>{ts}</span>
              <span className="opacity-70">({meta.range})</span>
            </div>
          );
        })}
      </div>

      {/* Timetable Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((k) => (
            <Skeleton key={k} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayDays.map((day) => {
            const daySlots = slotMap[day] ?? {};
            const hasAny = Object.keys(daySlots).length > 0;
            return (
              <Card
                key={day}
                className={`border-border transition-all duration-200 ${hasAny ? "hover:border-primary/30 hover:shadow-sm" : "opacity-60"}`}
                data-ocid={`schedule-day-${day.toLowerCase()}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-6 rounded-full bg-primary" />
                    <h3 className="font-display font-bold text-foreground text-base">
                      {day}
                    </h3>
                    {!hasAny && (
                      <Badge variant="outline" className="text-xs ml-2">
                        No classes
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {TIME_SLOTS.map((ts) => (
                      <div key={ts} className="space-y-1.5">
                        <div
                          className={`flex items-center gap-1.5 text-xs font-semibold ${TIME_SLOT_META[ts].color}`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{ts}</span>
                        </div>
                        <SlotCell slot={daySlots[ts]} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary stats */}
      {!isLoading && slots && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            {
              label: "Total Slots",
              value: slots.filter((s) => s.isActive).length,
            },
            { label: "Days Covered", value: activeDays.length || DAYS.length },
            {
              label: "Morning Slots",
              value: slots.filter((s) => s.isActive && s.timeSlot === "Morning")
                .length,
            },
            {
              label: "Afternoon Slots",
              value: slots.filter(
                (s) => s.isActive && s.timeSlot === "Afternoon",
              ).length,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl bg-muted/40 p-3 text-center border border-border"
            >
              <p className="text-2xl font-display font-bold text-primary">
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
