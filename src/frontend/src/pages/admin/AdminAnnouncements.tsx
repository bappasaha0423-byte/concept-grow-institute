import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { BellRing, Edit2, Megaphone, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AnnouncementPublic } from "../../backend.d.ts";
import {
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useListAnnouncements,
  useUpdateAnnouncement,
} from "../../hooks/useBackend";

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface AnnouncementFormProps {
  initial?: { title: string; message: string };
  onSubmit: (data: { title: string; message: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
  mode: "create" | "edit";
}

function AnnouncementForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
  mode,
}: AnnouncementFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");

  const valid = title.trim().length > 0 && message.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit({ title: title.trim(), message: message.trim() });
      }}
    >
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="ann-title">Title</Label>
          <Input
            id="ann-title"
            placeholder="e.g. Mid-term Exam Schedule"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-ocid="ann-title-input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ann-message">Message</Label>
          <Textarea
            id="ann-message"
            placeholder="Write your announcement message here…"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            data-ocid="ann-content-input"
          />
        </div>
      </div>
      <DialogFooter className="pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!valid || isLoading}
          data-ocid="ann-submit-btn"
        >
          {isLoading
            ? "Saving…"
            : mode === "create"
              ? "Publish Announcement"
              : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminAnnouncements() {
  const { data: announcements, isLoading } = useListAnnouncements();
  const createMut = useCreateAnnouncement();
  const updateMut = useUpdateAnnouncement();
  const deleteMut = useDeleteAnnouncement();

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AnnouncementPublic | null>(null);
  const [deleting, setDeleting] = useState<AnnouncementPublic | null>(null);

  const typedAnn = (announcements as AnnouncementPublic[] | undefined) ?? [];

  async function handleCreate(data: { title: string; message: string }) {
    try {
      await createMut.mutateAsync(data);
      toast.success("Announcement published successfully");
      setShowCreate(false);
    } catch {
      toast.error("Failed to publish announcement");
    }
  }

  async function handleUpdate(data: { title: string; message: string }) {
    if (!editing) return;
    try {
      await updateMut.mutateAsync({
        id: editing.id,
        title: data.title,
        message: data.message,
      });
      toast.success("Announcement updated");
      setEditing(null);
    } catch {
      toast.error("Failed to update announcement");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteMut.mutateAsync(deleting.id);
      toast.success("Announcement deleted");
      setDeleting(null);
    } catch {
      toast.error("Failed to delete announcement");
    }
  }

  return (
    <div className="p-6 space-y-6" data-ocid="admin-announcements">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Announcements
            </h1>
            <p className="text-sm text-muted-foreground">
              {typedAnn.length} announcement{typedAnn.length !== 1 ? "s" : ""}{" "}
              sent
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2"
          data-ocid="ann-create-btn"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </div>

      {/* List */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            All Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-4">
              {["a1", "a2", "a3"].map((k) => (
                <Skeleton key={k} className="h-20 w-full" />
              ))}
            </div>
          ) : typedAnn.length === 0 ? (
            <div className="text-center py-16">
              <BellRing className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">
                No announcements yet
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Keep students informed about upcoming events and news.
              </p>
              <Button
                onClick={() => setShowCreate(true)}
                variant="outline"
                data-ocid="ann-empty-cta"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Announcement
              </Button>
            </div>
          ) : (
            <div className="space-y-0">
              {typedAnn.map((ann, i) => (
                <div key={String(ann.id)}>
                  <div
                    className="py-4 flex items-start gap-4"
                    data-ocid={`ann-item-${String(ann.id)}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Megaphone className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-foreground truncate">
                            {ann.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {ann.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => setEditing(ann)}
                            data-ocid={`ann-edit-${String(ann.id)}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleting(ann)}
                            data-ocid={`ann-delete-${String(ann.id)}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {formatDate(ann.createdAt)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {i < typedAnn.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg" data-ocid="ann-create-dialog">
          <DialogHeader>
            <DialogTitle className="font-display">New Announcement</DialogTitle>
          </DialogHeader>
          <AnnouncementForm
            mode="create"
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            isLoading={createMut.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="max-w-lg" data-ocid="ann-edit-dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Edit Announcement
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <AnnouncementForm
              mode="edit"
              initial={{ title: editing.title, message: editing.message }}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
              isLoading={updateMut.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent data-ocid="ann-delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Announcement?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{deleting?.title}" and cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="ann-delete-confirm-btn"
            >
              {deleteMut.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
