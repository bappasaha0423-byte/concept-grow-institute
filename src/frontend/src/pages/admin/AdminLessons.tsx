import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { BookOpenText, Layers, PencilLine, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { LessonPublic } from "../../backend.d.ts";
import {
  useCreateLesson,
  useDeleteLesson,
  useListCourses,
  useListLessons,
  useUpdateLesson,
} from "../../hooks/useBackend";

interface LessonForm {
  title: string;
  content: string;
  order: number;
}

const defaultLessonForm: LessonForm = { title: "", content: "", order: 1 };

function LessonList({
  courseId,
  courseName,
}: {
  courseId: bigint;
  courseName: string;
}) {
  const { data: lessons, isLoading } = useListLessons(courseId);
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LessonPublic | null>(null);
  const [form, setForm] = useState<LessonForm>(defaultLessonForm);
  const [deleteTarget, setDeleteTarget] = useState<LessonPublic | null>(null);

  const sorted = [...(lessons ?? [])].sort(
    (a, b) => Number(a.order) - Number(b.order),
  );

  function openCreate() {
    const nextOrder = sorted.length
      ? Number(sorted[sorted.length - 1].order) + 1
      : 1;
    setEditing(null);
    setForm({ title: "", content: "", order: nextOrder });
    setModalOpen(true);
  }

  function openEdit(l: LessonPublic) {
    setEditing(l);
    setForm({ title: l.title, content: l.content, order: Number(l.order) });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Lesson title is required");
      return;
    }
    if (editing) {
      const res = await updateLesson.mutateAsync({
        id: editing.id,
        courseId,
        title: form.title,
        content: form.content,
        order: BigInt(form.order),
      });
      if (res.__kind__ === "ok") {
        toast.success("Lesson updated");
        setModalOpen(false);
      } else {
        toast.error(res.err);
      }
    } else {
      const res = await createLesson.mutateAsync({
        courseId,
        title: form.title,
        content: form.content,
        order: BigInt(form.order),
      });
      if (res.__kind__ === "ok") {
        toast.success("Lesson created");
        setModalOpen(false);
      } else {
        toast.error(res.err);
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await deleteLesson.mutateAsync({
      id: deleteTarget.id,
      courseId,
    });
    if (res.__kind__ === "ok") {
      toast.success("Lesson deleted");
    } else {
      toast.error(res.err);
    }
    setDeleteTarget(null);
  }

  const isPending = createLesson.isPending || updateLesson.isPending;

  return (
    <Card className="border-border" data-ocid={`lesson-card-${courseId}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <BookOpenText className="w-4 h-4 text-primary" />
            {courseName}
            <Badge variant="secondary" className="text-xs font-normal">
              {sorted.length} lesson{sorted.length !== 1 ? "s" : ""}
            </Badge>
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={openCreate}
            data-ocid={`lesson-add-${courseId}`}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((k) => (
              <Skeleton key={k} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : !sorted.length ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No lessons yet. Add the first lesson above.
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((lesson, idx) => (
              <div
                key={lesson.id.toString()}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                data-ocid={`lesson-row-${lesson.id}`}
              >
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="flex-1 text-sm font-medium text-foreground truncate min-w-0">
                  {lesson.title}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7"
                    onClick={() => openEdit(lesson)}
                    aria-label="Edit lesson"
                    data-ocid={`lesson-edit-${lesson.id}`}
                  >
                    <PencilLine className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(lesson)}
                    aria-label="Delete lesson"
                    data-ocid={`lesson-delete-${lesson.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Lesson Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg" data-ocid="lesson-modal">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit Lesson" : "New Lesson"} — {courseName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lesson-title">Title *</Label>
              <Input
                id="lesson-title"
                placeholder="e.g. Introduction to Algebra"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                data-ocid="lesson-title-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-order">Order</Label>
              <Input
                id="lesson-order"
                type="number"
                min={1}
                value={form.order}
                onChange={(e) =>
                  setForm({
                    ...form,
                    order: Math.max(1, Number.parseInt(e.target.value) || 1),
                  })
                }
                className="w-24"
                data-ocid="lesson-order-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-content">Content</Label>
              <Textarea
                id="lesson-content"
                placeholder="Write lesson content here (supports markdown)..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                data-ocid="lesson-content-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              data-ocid="lesson-save-btn"
            >
              {isPending ? "Saving…" : editing ? "Save Changes" : "Add Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              Delete Lesson?
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
              disabled={deleteLesson.isPending}
              data-ocid="lesson-confirm-delete"
            >
              {deleteLesson.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function AdminLessons() {
  const { data: courses, isLoading: loadingCourses } = useListCourses();

  return (
    <div className="p-6 space-y-6" data-ocid="admin-lessons">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
          <Layers className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Lessons
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage lessons for each course
          </p>
        </div>
      </div>

      {loadingCourses ? (
        <div className="space-y-4">
          {[1, 2, 3].map((k) => (
            <Skeleton key={k} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : !courses?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Layers className="w-14 h-14 text-muted-foreground mb-4" />
          <h3 className="text-lg font-display font-semibold text-foreground mb-1">
            No courses found
          </h3>
          <p className="text-sm text-muted-foreground">
            Create a course first, then add lessons to it.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <LessonList
              key={course.id.toString()}
              courseId={course.id}
              courseName={course.title}
            />
          ))}
        </div>
      )}
    </div>
  );
}
