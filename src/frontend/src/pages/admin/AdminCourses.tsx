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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, FolderOpen, PencilLine, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { CoursePublic } from "../../backend.d.ts";
import {
  useCreateCourse,
  useDeleteCourse,
  useListCourses,
  useUpdateCourse,
} from "../../hooks/useBackend";

const CATEGORIES = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Geography",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Other",
];

interface CourseFormState {
  title: string;
  description: string;
  category: string;
  published: boolean;
}

const defaultForm: CourseFormState = {
  title: "",
  description: "",
  category: "Other",
  published: false,
};

export default function AdminCourses() {
  const { data: courses, isLoading } = useListCourses();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CoursePublic | null>(null);
  const [form, setForm] = useState<CourseFormState>(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState<CoursePublic | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(course: CoursePublic) {
    setEditing(course);
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      published: course.published,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Course title is required");
      return;
    }
    if (editing) {
      const res = await updateCourse.mutateAsync({
        id: editing.id,
        title: form.title,
        description: form.description,
        category: form.category,
        published: form.published,
      });
      if (res.__kind__ === "ok") {
        toast.success("Course updated");
        setModalOpen(false);
      } else {
        toast.error(res.err);
      }
    } else {
      const res = await createCourse.mutateAsync({
        title: form.title,
        description: form.description,
        category: form.category,
      });
      if (res.__kind__ === "ok") {
        toast.success("Course created");
        setModalOpen(false);
      } else {
        toast.error(res.err);
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await deleteCourse.mutateAsync(deleteTarget.id);
    if (res.__kind__ === "ok") {
      toast.success("Course deleted");
    } else {
      toast.error(res.err);
    }
    setDeleteTarget(null);
  }

  const isPending = createCourse.isPending || updateCourse.isPending;

  return (
    <div className="p-6 space-y-6" data-ocid="admin-courses">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Courses
            </h1>
            <p className="text-sm text-muted-foreground">
              {courses?.length ?? 0} course{courses?.length !== 1 ? "s" : ""}{" "}
              total
            </p>
          </div>
        </div>
        <Button onClick={openCreate} data-ocid="course-create-btn">
          <Plus className="w-4 h-4 mr-2" />
          New Course
        </Button>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <Skeleton key={k} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : !courses?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="w-14 h-14 text-muted-foreground mb-4" />
          <h3 className="text-lg font-display font-semibold text-foreground mb-1">
            No courses yet
          </h3>
          <p className="text-muted-foreground text-sm mb-5">
            Create your first course to get students learning.
          </p>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card
              key={course.id.toString()}
              className="group border-border hover:border-primary/30 hover:shadow-md transition-all duration-200"
              data-ocid={`course-card-${course.id}`}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground truncate text-base">
                      {course.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="mt-1 text-xs font-normal"
                    >
                      {course.category}
                    </Badge>
                  </div>
                  <Badge
                    variant={course.published ? "default" : "outline"}
                    className="shrink-0 text-xs"
                  >
                    {course.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description || "No description provided."}
                </p>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(course)}
                    data-ocid={`course-edit-${course.id}`}
                  >
                    <PencilLine className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(course)}
                    data-ocid={`course-delete-${course.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md" data-ocid="course-modal">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit Course" : "New Course"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="course-title">Title *</Label>
              <Input
                id="course-title"
                placeholder="e.g. Class 10 Mathematics"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                data-ocid="course-title-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-desc">Description</Label>
              <Textarea
                id="course-desc"
                placeholder="Brief description of the course..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                data-ocid="course-desc-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-cat">Category</Label>
              <select
                id="course-cat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                data-ocid="course-cat-select"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {editing && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Switch
                  id="course-published"
                  checked={form.published}
                  onCheckedChange={(v) => setForm({ ...form, published: v })}
                  data-ocid="course-published-toggle"
                />
                <Label htmlFor="course-published" className="cursor-pointer">
                  {form.published
                    ? "Published (visible to students)"
                    : "Draft (hidden from students)"}
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
              data-ocid="course-save-btn"
            >
              {isPending
                ? "Saving…"
                : editing
                  ? "Save Changes"
                  : "Create Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm" data-ocid="course-delete-modal">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              Delete Course?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.title}
            </span>
            ? This will also remove all lessons and quizzes under it. This
            action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCourse.isPending}
              data-ocid="course-confirm-delete"
            >
              {deleteCourse.isPending ? "Deleting…" : "Delete Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
