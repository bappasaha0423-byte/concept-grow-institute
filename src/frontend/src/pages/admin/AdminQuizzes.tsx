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
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  HelpCircle,
  PencilLine,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  CoursePublic,
  QuestionWithAnswer,
  QuizPublic,
} from "../../backend.d.ts";
import {
  useCreateQuestion,
  useCreateQuiz,
  useDeleteQuestion,
  useDeleteQuiz,
  useListCourses,
  useListQuestionsWithAnswers,
  useListQuizzes,
  useUpdateQuestion,
  useUpdateQuiz,
} from "../../hooks/useBackend";

// ─── Question Manager ─────────────────────────────────────────────────────────

interface QuestionForm {
  text: string;
  options: [string, string, string, string];
  answerIndex: number;
}

const defaultQuestion: QuestionForm = {
  text: "",
  options: ["", "", "", ""],
  answerIndex: 0,
};

const OPTION_LABELS = ["A", "B", "C", "D"];

function QuestionManager({
  quizId,
  quizTitle,
}: { quizId: bigint; quizTitle: string }) {
  const { data: questions, isLoading } = useListQuestionsWithAnswers(quizId);
  const createQ = useCreateQuestion();
  const updateQ = useUpdateQuestion();
  const deleteQ = useDeleteQuestion();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionWithAnswer | null>(null);
  const [form, setForm] = useState<QuestionForm>(defaultQuestion);
  const [deleteTarget, setDeleteTarget] = useState<QuestionWithAnswer | null>(
    null,
  );

  function openCreate() {
    setEditing(null);
    setForm(defaultQuestion);
    setModalOpen(true);
  }

  function openEdit(q: QuestionWithAnswer) {
    setEditing(q);
    const opts = [...q.options] as [string, string, string, string];
    while (opts.length < 4) opts.push("");
    setForm({
      text: q.text,
      options: opts as [string, string, string, string],
      answerIndex: Number(q.answerIndex),
    });
    setModalOpen(true);
  }

  function setOption(idx: number, val: string) {
    const opts = [...form.options] as [string, string, string, string];
    opts[idx] = val;
    setForm({ ...form, options: opts });
  }

  async function handleSave() {
    if (!form.text.trim()) {
      toast.error("Question text is required");
      return;
    }
    if (form.options.some((o) => !o.trim())) {
      toast.error("All four options must be filled in");
      return;
    }
    if (editing) {
      const res = await updateQ.mutateAsync({
        id: editing.id,
        quizId,
        text: form.text,
        options: form.options,
        answerIndex: BigInt(form.answerIndex),
      });
      if (res.__kind__ === "ok") {
        toast.success("Question updated");
        setModalOpen(false);
      } else {
        toast.error(res.err);
      }
    } else {
      const res = await createQ.mutateAsync({
        quizId,
        text: form.text,
        options: form.options,
        answerIndex: BigInt(form.answerIndex),
      });
      if (res.__kind__ === "ok") {
        toast.success("Question added");
        setModalOpen(false);
      } else {
        toast.error(res.err);
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await deleteQ.mutateAsync({ id: deleteTarget.id, quizId });
    if (res.__kind__ === "ok") {
      toast.success("Question deleted");
    } else {
      toast.error(res.err);
    }
    setDeleteTarget(null);
  }

  const isPending = createQ.isPending || updateQ.isPending;

  return (
    <>
      <div className="mt-3 space-y-2">
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : !questions?.length ? (
          <p className="text-xs text-muted-foreground italic">
            No questions yet.
          </p>
        ) : (
          questions.map((q, qi) => (
            <div
              key={q.id.toString()}
              className="p-3 rounded-lg border border-border bg-background"
              data-ocid={`question-row-${q.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground flex-1 min-w-0">
                  <span className="text-muted-foreground mr-1">Q{qi + 1}.</span>
                  {q.text}
                </p>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7"
                    onClick={() => openEdit(q)}
                    aria-label="Edit question"
                  >
                    <PencilLine className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(q)}
                    aria-label="Delete question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1">
                {q.options.map((opt, oi) => (
                  <span
                    key={`${q.id.toString()}-opt-${oi}`}
                    className={`text-xs px-2 py-0.5 rounded ${
                      oi === Number(q.answerIndex)
                        ? "bg-accent/20 text-accent-foreground font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {OPTION_LABELS[oi]}. {opt}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={openCreate}
          className="mt-1"
          data-ocid={`question-add-${quizId}`}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Question
        </Button>
      </div>

      {/* Question Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg" data-ocid="question-modal">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit Question" : "New Question"} — {quizTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="q-text">Question *</Label>
              <Textarea
                id="q-text"
                placeholder="Enter your question..."
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                rows={2}
                data-ocid="question-text-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Answer Options (click letter to mark correct)</Label>
              {form.options.map((opt, i) => (
                <div key={OPTION_LABELS[i]} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, answerIndex: i })}
                    className={`w-7 h-7 rounded-full border-2 text-xs font-bold flex-shrink-0 flex items-center justify-center transition-colors ${
                      form.answerIndex === i
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border text-muted-foreground hover:border-primary"
                    }`}
                    data-ocid={`answer-option-${i}`}
                    aria-label={`Mark option ${OPTION_LABELS[i]} as correct`}
                  >
                    {OPTION_LABELS[i]}
                  </button>
                  <Input
                    placeholder={`Option ${OPTION_LABELS[i]}`}
                    value={opt}
                    onChange={(e) => setOption(i, e.target.value)}
                    data-ocid={`option-input-${i}`}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              data-ocid="question-save-btn"
            >
              {isPending
                ? "Saving…"
                : editing
                  ? "Save Changes"
                  : "Add Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Question */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              Delete Question?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This question will be permanently deleted.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteQ.isPending}
              data-ocid="question-confirm-delete"
            >
              {deleteQ.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Quiz Row ─────────────────────────────────────────────────────────────────

function QuizRow({
  quiz,
  onEdit,
  onDelete,
}: {
  quiz: QuizPublic;
  onEdit: (q: QuizPublic) => void;
  onDelete: (q: QuizPublic) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="border border-border rounded-xl overflow-hidden bg-card"
      data-ocid={`quiz-row-${quiz.id}`}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-sm text-foreground truncate">
            {quiz.title}
          </p>
          {quiz.description && (
            <p className="text-xs text-muted-foreground truncate">
              {quiz.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => onEdit(quiz)}
            aria-label="Edit quiz"
            data-ocid={`quiz-edit-${quiz.id}`}
          >
            <PencilLine className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(quiz)}
            aria-label="Delete quiz"
            data-ocid={`quiz-delete-${quiz.id}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse questions" : "Expand questions"}
            data-ocid={`quiz-expand-${quiz.id}`}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-border bg-muted/20">
          <QuestionManager quizId={quiz.id} quizTitle={quiz.title} />
        </div>
      )}
    </div>
  );
}

// ─── Per-course quiz section ──────────────────────────────────────────────────

function CourseQuizSection({
  course,
  onCreateQuiz,
  onEditQuiz,
  onDeleteQuiz,
}: {
  course: CoursePublic;
  onCreateQuiz: (courseId: bigint) => void;
  onEditQuiz: (q: QuizPublic) => void;
  onDeleteQuiz: (q: QuizPublic) => void;
}) {
  const { data: quizzes, isLoading } = useListQuizzes(course.id);

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            {course.title}
            <Badge variant="secondary" className="text-xs font-normal">
              {quizzes?.length ?? 0} quiz
              {(quizzes?.length ?? 0) !== 1 ? "zes" : ""}
            </Badge>
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCreateQuiz(course.id)}
            data-ocid={`quiz-add-${course.id}`}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Quiz
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {isLoading ? (
          <Skeleton className="h-14 w-full" />
        ) : !quizzes?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No quizzes for this course yet.
          </p>
        ) : (
          quizzes.map((quiz) => (
            <QuizRow
              key={quiz.id.toString()}
              quiz={quiz}
              onEdit={onEditQuiz}
              onDelete={onDeleteQuiz}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface QuizForm {
  courseId: bigint;
  title: string;
  description: string;
}

export default function AdminQuizzes() {
  const { data: courses, isLoading: loadingCourses } = useListCourses();
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();
  const deleteQuiz = useDeleteQuiz();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<QuizPublic | null>(null);
  const [form, setForm] = useState<QuizForm>({
    courseId: 0n,
    title: "",
    description: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<QuizPublic | null>(null);

  function openCreate(courseId: bigint) {
    setEditing(null);
    setForm({ courseId, title: "", description: "" });
    setModalOpen(true);
  }

  function openEdit(q: QuizPublic) {
    setEditing(q);
    setForm({
      courseId: q.courseId,
      title: q.title,
      description: q.description,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Quiz title is required");
      return;
    }
    if (editing) {
      const res = await updateQuiz.mutateAsync({
        id: editing.id,
        title: form.title,
        description: form.description,
      });
      if (res.__kind__ === "ok") {
        toast.success("Quiz updated");
        setModalOpen(false);
      } else {
        toast.error(res.err);
      }
    } else {
      const res = await createQuiz.mutateAsync({
        courseId: form.courseId,
        title: form.title,
        description: form.description,
      });
      if (res.__kind__ === "ok") {
        toast.success("Quiz created");
        setModalOpen(false);
      } else {
        toast.error(res.err);
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await deleteQuiz.mutateAsync(deleteTarget.id);
    if (res.__kind__ === "ok") {
      toast.success("Quiz deleted");
    } else {
      toast.error(res.err);
    }
    setDeleteTarget(null);
  }

  const isPending = createQuiz.isPending || updateQuiz.isPending;

  if (loadingCourses) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1, 2].map((k) => (
          <Skeleton key={k} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-ocid="admin-quizzes">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Quizzes
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage quizzes and questions by course
          </p>
        </div>
      </div>

      {!courses?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardList className="w-14 h-14 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">
            Create a course first, then add quizzes to it.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <CourseQuizSection
              key={course.id.toString()}
              course={course}
              onCreateQuiz={openCreate}
              onEditQuiz={openEdit}
              onDeleteQuiz={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Quiz Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md" data-ocid="quiz-modal">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit Quiz" : "New Quiz"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="quiz-title">Title *</Label>
              <Input
                id="quiz-title"
                placeholder="e.g. Chapter 3 Assessment"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                data-ocid="quiz-title-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quiz-desc">Description</Label>
              <Textarea
                id="quiz-desc"
                placeholder="Brief description of this quiz..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
                data-ocid="quiz-desc-input"
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
              data-ocid="quiz-save-btn"
            >
              {isPending ? "Saving…" : editing ? "Save Changes" : "Create Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Quiz */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm" data-ocid="quiz-delete-modal">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              Delete Quiz?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.title}
            </span>{" "}
            and all its questions? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteQuiz.isPending}
              data-ocid="quiz-confirm-delete"
            >
              {deleteQuiz.isPending ? "Deleting…" : "Delete Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
