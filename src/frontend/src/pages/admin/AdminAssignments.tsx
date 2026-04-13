import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarClock,
  ClipboardCheck,
  PencilLine,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AssignmentPublic } from "../../backend.d.ts";
import {
  useCreateAssignment,
  useDeleteAssignment,
  useListAssignments,
  useListCourses,
  useUpdateAssignment,
} from "../../hooks/useBackend";

interface AssignmentForm {
  title: string;
  description: string;
  courseId: string; // "" = no course
  dueDate: string; // ISO date string or ""
  maxPoints: number;
}

const defaultForm: AssignmentForm = {
  title: "",
  description: "",
  courseId: "",
  dueDate: "",
  maxPoints: 100,
};

function formatDate(ts: bigint | undefined) {
  if (!ts) return null;
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function dateToTimestamp(dateStr: string): bigint | null {
  if (!dateStr) return null;
  const ms = new Date(dateStr).getTime();
  if (Number.isNaN(ms)) return null;
  return BigInt(ms) * 1_000_000n;
}

function timestampToDate(ts: bigint | undefined): string {
  if (!ts) return "";
  const d = new Date(Number(ts / 1_000_000n));
  return d.toISOString().split("T")[0];
}

export default function AdminAssignments() {
  const { data: courses } = useListCourses();
  const [filterCourseId, setFilterCourseId] = useState<bigint | undefined>(
    undefined,
  );
  const { data: assignments, isLoading } = useListAssignments(filterCourseId);

  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();
  const deleteAssignment = useDeleteAssignment();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AssignmentPublic | null>(null);
  const [form, setForm] = useState<AssignmentForm>(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState<AssignmentPublic | null>(
    null,
  );

  function openCreate() {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(a: AssignmentPublic) {
    setEditing(a);
    setForm({
      title: a.title,
      description: a.description,
      courseId: a.courseId ? a.courseId.toString() : "",
      dueDate: timestampToDate(a.dueDate),
      maxPoints: Number(a.maxPoints),
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Assignment title is required");
      return;
    }
    const courseId = form.courseId ? BigInt(form.courseId) : null;
    const dueDate = dateToTimestamp(form.dueDate);

    if (editing) {
      const res = await updateAssignment.mutateAsync({
        id: editing.id,
        title: form.title,
        description: form.description,
        dueDate,
        maxPoints: BigInt(form.maxPoints),
      });
      if (res.__kind__ === "ok") {
        toast.success("Assignment updated");
        setModalOpen(false);
      } else {
        toast.error(res.err);
      }
    } else {
      const res = await createAssignment.mutateAsync({
        courseId,
        title: form.title,
        description: form.description,
        dueDate,
        maxPoints: BigInt(form.maxPoints),
      });
      if (res.__kind__ === "ok") {
        toast.success("Assignment created");
        setModalOpen(false);
      } else {
        toast.error(res.err);
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await deleteAssignment.mutateAsync(deleteTarget.id);
    if (res.__kind__ === "ok") {
      toast.success("Assignment deleted");
    } else {
      toast.error(res.err);
    }
    setDeleteTarget(null);
  }

  const isPending = createAssignment.isPending || updateAssignment.isPending;

  function getCourseTitle(courseId: bigint | undefined) {
    if (!courseId || !courses) return null;
    return courses.find((c) => c.id === courseId)?.title ?? null;
  }

  function isDueSoon(dueDate: bigint | undefined) {
    if (!dueDate) return false;
    const ms = Number(dueDate / 1_000_000n);
    const diff = ms - Date.now();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
  }

  function isOverdue(dueDate: bigint | undefined) {
    if (!dueDate) return false;
    return Number(dueDate / 1_000_000n) < Date.now();
  }

  return (
    <div className="p-6 space-y-6" data-ocid="admin-assignments">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-chart-5/10 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-chart-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Assignments
            </h1>
            <p className="text-sm text-muted-foreground">
              {assignments?.length ?? 0} assignment
              {(assignments?.length ?? 0) !== 1 ? "s" : ""}
              {filterCourseId ? " in selected course" : " total"}
            </p>
          </div>
        </div>
        <Button onClick={openCreate} data-ocid="assignment-create-btn">
          <Plus className="w-4 h-4 mr-2" />
          New Assignment
        </Button>
      </div>

      {/* Course Filter */}
      <div
        className="flex flex-wrap gap-2"
        data-ocid="assignment-course-filter"
      >
        <button
          type="button"
          onClick={() => setFilterCourseId(undefined)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !filterCourseId
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All Courses
        </button>
        {courses?.map((c) => (
          <button
            key={c.id.toString()}
            type="button"
            onClick={() => setFilterCourseId(c.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors truncate max-w-[180px] ${
              filterCourseId === c.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((k) => (
            <Skeleton key={k} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : !assignments?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardCheck className="w-14 h-14 text-muted-foreground mb-4" />
          <h3 className="text-lg font-display font-semibold text-foreground mb-1">
            No assignments yet
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            Create assignments to track student work and progress.
          </p>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const courseTitle = getCourseTitle(a.courseId);
            const dueSoon = isDueSoon(a.dueDate);
            const overdue = isOverdue(a.dueDate);
            return (
              <Card
                key={a.id.toString()}
                className="border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                data-ocid={`assignment-card-${a.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-semibold text-foreground">
                          {a.title}
                        </h3>
                        {courseTitle && (
                          <Badge variant="secondary" className="text-xs">
                            {courseTitle}
                          </Badge>
                        )}
                        {overdue && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                        {dueSoon && !overdue && (
                          <Badge className="text-xs bg-chart-5 text-primary-foreground">
                            Due Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {a.description || "No description."}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {a.dueDate && (
                          <span className="flex items-center gap-1">
                            <CalendarClock className="w-3.5 h-3.5" />
                            Due: {formatDate(a.dueDate)}
                          </span>
                        )}
                        <span className="font-medium text-foreground">
                          {Number(a.maxPoints)} pts
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(a)}
                        data-ocid={`assignment-edit-${a.id}`}
                      >
                        <PencilLine className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(a)}
                        data-ocid={`assignment-delete-${a.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg" data-ocid="assignment-modal">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit Assignment" : "New Assignment"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="asgn-title">Title *</Label>
              <Input
                id="asgn-title"
                placeholder="e.g. Chapter 5 Practice Problems"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                data-ocid="assignment-title-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="asgn-course">Course (optional)</Label>
              <select
                id="asgn-course"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                data-ocid="assignment-course-select"
              >
                <option value="">— No specific course —</option>
                {courses?.map((c) => (
                  <option key={c.id.toString()} value={c.id.toString()}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="asgn-desc">Description</Label>
              <Textarea
                id="asgn-desc"
                placeholder="Describe what students need to do..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
                data-ocid="assignment-desc-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="asgn-due">Due Date</Label>
                <Input
                  id="asgn-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                  data-ocid="assignment-due-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="asgn-points">Max Points</Label>
                <Input
                  id="asgn-points"
                  type="number"
                  min={1}
                  value={form.maxPoints}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      maxPoints: Math.max(
                        1,
                        Number.parseInt(e.target.value) || 1,
                      ),
                    })
                  }
                  data-ocid="assignment-points-input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              data-ocid="assignment-save-btn"
            >
              {isPending
                ? "Saving…"
                : editing
                  ? "Save Changes"
                  : "Create Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm" data-ocid="assignment-delete-modal">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              Delete Assignment?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.title}
            </span>
            ? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAssignment.isPending}
              data-ocid="assignment-confirm-delete"
            >
              {deleteAssignment.isPending ? "Deleting…" : "Delete Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
