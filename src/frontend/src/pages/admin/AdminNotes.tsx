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
import { FileText, Notebook, PencilLine, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { NotePublic } from "../../backend.d.ts";
import {
  useCreateNote,
  useDeleteNote,
  useListCourses,
  useListNotes,
  useUpdateNote,
} from "../../hooks/useBackend";

interface NoteForm {
  title: string;
  content: string;
  courseId: string; // "" = no course
}

const defaultForm: NoteForm = { title: "", content: "", courseId: "" };

function formatDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminNotes() {
  const { data: courses } = useListCourses();
  const [filterCourseId, setFilterCourseId] = useState<bigint | undefined>(
    undefined,
  );
  const { data: notes, isLoading } = useListNotes(filterCourseId);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NotePublic | null>(null);
  const [form, setForm] = useState<NoteForm>(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState<NotePublic | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(note: NotePublic) {
    setEditing(note);
    setForm({
      title: note.title,
      content: note.content,
      courseId: note.courseId ? note.courseId.toString() : "",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Note title is required");
      return;
    }
    const courseId = form.courseId ? BigInt(form.courseId) : null;
    if (editing) {
      const res = await updateNote.mutateAsync({
        id: editing.id,
        title: form.title,
        content: form.content,
      });
      if (res.__kind__ === "ok") {
        toast.success("Note updated");
        setModalOpen(false);
      } else {
        toast.error(res.err);
      }
    } else {
      const res = await createNote.mutateAsync({
        courseId,
        title: form.title,
        content: form.content,
      });
      if (res.__kind__ === "ok") {
        toast.success("Note created");
        setModalOpen(false);
      } else {
        toast.error(res.err);
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await deleteNote.mutateAsync(deleteTarget.id);
    if (res.__kind__ === "ok") {
      toast.success("Note deleted");
    } else {
      toast.error(res.err);
    }
    setDeleteTarget(null);
  }

  const isPending = createNote.isPending || updateNote.isPending;

  function getCourseTitle(courseId: bigint | undefined) {
    if (!courseId || !courses) return null;
    return courses.find((c) => c.id === courseId)?.title ?? null;
  }

  return (
    <div className="p-6 space-y-6" data-ocid="admin-notes">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Notebook className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Notes
            </h1>
            <p className="text-sm text-muted-foreground">
              {notes?.length ?? 0} note{(notes?.length ?? 0) !== 1 ? "s" : ""}
              {filterCourseId ? " in selected course" : " across all courses"}
            </p>
          </div>
        </div>
        <Button onClick={openCreate} data-ocid="note-create-btn">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Course Filter */}
      <div className="flex flex-wrap gap-2" data-ocid="note-course-filter">
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

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((k) => (
            <Skeleton key={k} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : !notes?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-14 h-14 text-muted-foreground mb-4" />
          <h3 className="text-lg font-display font-semibold text-foreground mb-1">
            No notes yet
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            Create study notes to help students learn.
          </p>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => {
            const courseTitle = getCourseTitle(note.courseId);
            return (
              <Card
                key={note.id.toString()}
                className="group border-border hover:border-accent/30 hover:shadow-md transition-all duration-200"
                data-ocid={`note-card-${note.id}`}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-foreground truncate text-base">
                        {note.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                    {courseTitle && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {courseTitle}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.content || "No content."}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(note)}
                      data-ocid={`note-edit-${note.id}`}
                    >
                      <PencilLine className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(note)}
                      data-ocid={`note-delete-${note.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg" data-ocid="note-modal">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit Note" : "New Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="note-title">Title *</Label>
              <Input
                id="note-title"
                placeholder="e.g. Quadratic Equations Summary"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                data-ocid="note-title-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note-course">Course (optional)</Label>
              <select
                id="note-course"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                data-ocid="note-course-select"
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
              <Label htmlFor="note-content">Content</Label>
              <Textarea
                id="note-content"
                placeholder="Write the note content here (supports markdown)..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={8}
                data-ocid="note-content-input"
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
              data-ocid="note-save-btn"
            >
              {isPending ? "Saving…" : editing ? "Save Changes" : "Create Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm" data-ocid="note-delete-modal">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              Delete Note?
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
              disabled={deleteNote.isPending}
              data-ocid="note-confirm-delete"
            >
              {deleteNote.isPending ? "Deleting…" : "Delete Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
