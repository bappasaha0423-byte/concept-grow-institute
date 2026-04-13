import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarDays, PencilLine, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateScheduleSlot,
  useDeleteScheduleSlot,
  useListScheduleSlots,
  useUpdateScheduleSlot,
} from "../../hooks/useBackend";
import type { ScheduleInput, ScheduleSlot } from "../../types/index";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];
const TIME_RANGES: Record<string, string> = {
  Morning: "7:00 AM – 10:00 AM",
  Afternoon: "10:30 AM – 4:00 PM",
  Evening: "2:00 PM – 5:30 PM",
};

const defaultForm: ScheduleInput & { isActive: boolean } = {
  className: "Class 12",
  day: "Monday",
  timeSlot: "Morning",
  timeRange: "7:00 AM – 10:00 AM",
  subject: "",
  teacher: "",
  isActive: true,
};

export default function AdminSchedules() {
  const { data: slots, isLoading } = useListScheduleSlots();
  const createSlot = useCreateScheduleSlot();
  const updateSlot = useUpdateScheduleSlot();
  const deleteSlot = useDeleteScheduleSlot();

  const [classFilter, setClassFilter] = useState("Class 12");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleSlot | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleSlot | null>(null);

  const filtered =
    slots?.filter((s) => (classFilter ? s.className === classFilter : true)) ??
    [];

  function openCreate() {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(slot: ScheduleSlot) {
    setEditing(slot);
    setForm({
      className: slot.className,
      day: slot.day,
      timeSlot: slot.timeSlot,
      timeRange: slot.timeRange,
      subject: slot.subject,
      teacher: slot.teacher,
      isActive: slot.isActive,
    });
    setModalOpen(true);
  }

  function handleTimeSlotChange(ts: string) {
    setForm((f) => ({ ...f, timeSlot: ts, timeRange: TIME_RANGES[ts] ?? "" }));
  }

  async function handleSave() {
    if (!form.subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    const input: ScheduleInput = {
      className: form.className,
      day: form.day,
      timeSlot: form.timeSlot,
      timeRange: form.timeRange,
      subject: form.subject,
      teacher: form.teacher,
    };
    if (editing) {
      const res = await updateSlot.mutateAsync({ id: editing.id, input });
      if (res.__kind__ === "ok") {
        toast.success("Schedule slot updated");
        setModalOpen(false);
      } else {
        toast.error(res.err);
      }
    } else {
      const res = await createSlot.mutateAsync(input);
      if (res.__kind__ === "ok") {
        toast.success("Schedule slot created");
        setModalOpen(false);
      } else {
        toast.error(res.err);
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await deleteSlot.mutateAsync(deleteTarget.id);
    if (res.__kind__ === "ok") {
      toast.success("Schedule slot deleted");
    } else {
      toast.error(res.err);
    }
    setDeleteTarget(null);
  }

  const isPending = createSlot.isPending || updateSlot.isPending;

  return (
    <div className="p-6 space-y-6" data-ocid="admin-schedules">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Class 12 Routine / Timetable
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage schedule slots for all classes
            </p>
          </div>
        </div>
        <Button onClick={openCreate} data-ocid="schedule-create-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Slot
        </Button>
      </div>

      {/* Schedule Image */}
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
            Where Concepts Grow Into Success
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Label className="text-sm font-medium shrink-0">Filter by Class:</Label>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          data-ocid="schedule-class-filter"
        >
          <option value="">All Classes</option>
          <option value="Class 11">Class 11</option>
          <option value="Class 12">Class 12</option>
        </select>
        <Badge variant="secondary" className="ml-auto">
          {filtered.length} slot{filtered.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((k) => (
            <Skeleton key={k} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : !filtered.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-border">
          <CalendarDays className="w-12 h-12 text-muted-foreground mb-3" />
          <h3 className="text-base font-display font-semibold text-foreground mb-1">
            No schedule slots found
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add slots to build the timetable.
          </p>
          <Button onClick={openCreate} size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Slot
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Day</TableHead>
                <TableHead>Time Slot</TableHead>
                <TableHead>Time Range</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((slot) => (
                <TableRow
                  key={slot.id.toString()}
                  data-ocid={`schedule-row-${slot.id}`}
                >
                  <TableCell className="font-medium">{slot.day}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {slot.timeSlot}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {slot.timeRange}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {slot.subject}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {slot.teacher || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {slot.className}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={slot.isActive ? "default" : "outline"}
                      className="text-xs"
                    >
                      {slot.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(slot)}
                        data-ocid={`schedule-edit-${slot.id}`}
                      >
                        <PencilLine className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(slot)}
                        data-ocid={`schedule-delete-${slot.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md" data-ocid="schedule-modal">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit Schedule Slot" : "New Schedule Slot"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Class</Label>
                <select
                  value={form.className}
                  onChange={(e) =>
                    setForm({ ...form, className: e.target.value })
                  }
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  data-ocid="schedule-class-input"
                >
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Day</Label>
                <select
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  data-ocid="schedule-day-input"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Time Slot</Label>
                <select
                  value={form.timeSlot}
                  onChange={(e) => handleTimeSlotChange(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  data-ocid="schedule-timeslot-input"
                >
                  {TIME_SLOTS.map((ts) => (
                    <option key={ts} value={ts}>
                      {ts}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Time Range</Label>
                <Input
                  value={form.timeRange}
                  onChange={(e) =>
                    setForm({ ...form, timeRange: e.target.value })
                  }
                  placeholder="e.g. 7:00 AM – 10:00 AM"
                  data-ocid="schedule-timerange-input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Subject *</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Mathematics"
                data-ocid="schedule-subject-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Teacher</Label>
              <Input
                value={form.teacher}
                onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                placeholder="e.g. Mr. Sharma"
                data-ocid="schedule-teacher-input"
              />
            </div>
            {editing && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Switch
                  id="slot-active"
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                  data-ocid="schedule-active-toggle"
                />
                <Label htmlFor="slot-active" className="cursor-pointer">
                  {form.isActive
                    ? "Active (visible to students)"
                    : "Inactive (hidden from students)"}
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              data-ocid="schedule-save-btn"
            >
              {isPending ? "Saving…" : editing ? "Save Changes" : "Add Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm" data-ocid="schedule-delete-modal">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              Delete Schedule Slot?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Remove{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.subject}
            </span>{" "}
            ({deleteTarget?.day}, {deleteTarget?.timeSlot})? This cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteSlot.isPending}
              data-ocid="schedule-confirm-delete"
            >
              {deleteSlot.isPending ? "Deleting…" : "Delete Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
