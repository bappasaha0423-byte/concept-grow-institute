import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  AssignmentId,
  CourseId,
  LessonId,
  NoteId,
  QuestionId,
  QuizId,
} from "../backend.d.ts";

// ─── Shared actor helper ──────────────────────────────────────────────────────

function useActorReady() {
  const { actor, isFetching } = useActor(createActor);
  return { actor, ready: !!actor && !isFetching };
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export function useListCourses() {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCourses();
    },
    enabled: ready,
  });
}

export function useGetCourse(id: bigint) {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["course", id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCourse(id);
    },
    enabled: ready && id > 0n,
  });
}

export function useCreateCourse() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      category,
    }: {
      title: string;
      description: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createCourse(title, description, category);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useUpdateCourse() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      category,
      published,
    }: {
      id: CourseId;
      title: string | null;
      description: string | null;
      category: string | null;
      published: boolean | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateCourse(id, title, description, category, published);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["course", vars.id.toString()] });
    },
  });
}

export function useDeleteCourse() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: CourseId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteCourse(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

// ─── Enrollments ──────────────────────────────────────────────────────────────

export function useMyEnrollments() {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyEnrollments();
    },
    enabled: ready,
  });
}

export function useEnrollInCourse() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: CourseId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.enrollInCourse(courseId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["enrollments"] }),
  });
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export function useListLessons(courseId: bigint) {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["lessons", courseId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listLessons(courseId);
    },
    enabled: ready && courseId > 0n,
  });
}

export function useCreateLesson() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      title,
      content,
      order,
    }: {
      courseId: CourseId;
      title: string;
      content: string;
      order: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createLesson(courseId, title, content, order);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["lessons", vars.courseId.toString()] }),
  });
}

export function useUpdateLesson() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      courseId: _courseId,
      title,
      content,
      order,
    }: {
      id: LessonId;
      courseId: bigint;
      title: string | null;
      content: string | null;
      order: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateLesson(id, title, content, order);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["lessons", vars.courseId.toString()] }),
  });
}

export function useDeleteLesson() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      courseId,
    }: { id: LessonId; courseId: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      void courseId;
      return actor.deleteLesson(id);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["lessons", vars.courseId.toString()] }),
  });
}

export function useMyCompletedLessons() {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["completedLessons"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyCompletedLessons();
    },
    enabled: ready,
  });
}

export function useMarkLessonComplete() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: LessonId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.markLessonComplete(lessonId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["completedLessons"] }),
  });
}

// ─── Quizzes ──────────────────────────────────────────────────────────────────

export function useListQuizzes(courseId?: bigint) {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["quizzes", courseId?.toString()],
    queryFn: async () => {
      if (!actor || !courseId) return [];
      return actor.listQuizzes(courseId);
    },
    enabled: ready && !!courseId,
  });
}

export function useListAllQuizzes() {
  const { actor, ready } = useActorReady();
  const { data: courses } = useListCourses();
  return useQuery({
    queryKey: ["quizzes-all", courses?.map((c) => c.id.toString()).join(",")],
    queryFn: async () => {
      if (!actor || !courses) return [];
      const results = await Promise.all(
        courses.map((c) => actor.listQuizzes(c.id)),
      );
      return results.flat();
    },
    enabled: ready && !!courses,
  });
}

export function useCreateQuiz() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      title,
      description,
    }: {
      courseId: CourseId;
      title: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createQuiz(courseId, title, description);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quizzes"] });
      qc.invalidateQueries({ queryKey: ["quizzes-all"] });
    },
  });
}

export function useUpdateQuiz() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
    }: {
      id: QuizId;
      title: string | null;
      description: string | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateQuiz(id, title, description);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quizzes"] });
      qc.invalidateQueries({ queryKey: ["quizzes-all"] });
    },
  });
}

export function useDeleteQuiz() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: QuizId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteQuiz(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quizzes"] });
      qc.invalidateQueries({ queryKey: ["quizzes-all"] });
    },
  });
}

export function useMyAttempts(quizId?: bigint) {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["myAttempts", quizId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyAttempts(quizId ?? null);
    },
    enabled: ready,
  });
}

// ─── Questions ────────────────────────────────────────────────────────────────

export function useListQuestions(quizId: bigint) {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["questions", quizId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listQuestions(quizId);
    },
    enabled: ready && quizId > 0n,
  });
}

export function useListQuestionsWithAnswers(quizId: bigint) {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["questionsWithAnswers", quizId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listQuestionsWithAnswers(quizId);
      if (result.__kind__ === "ok") return result.ok;
      return [];
    },
    enabled: ready && quizId > 0n,
  });
}

export function useCreateQuestion() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      quizId,
      text,
      options,
      answerIndex,
    }: {
      quizId: QuizId;
      text: string;
      options: string[];
      answerIndex: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createQuestion(quizId, text, options, answerIndex);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["questions", vars.quizId.toString()] });
      qc.invalidateQueries({
        queryKey: ["questionsWithAnswers", vars.quizId.toString()],
      });
      qc.invalidateQueries({ queryKey: ["quizzes-all"] });
    },
  });
}

export function useUpdateQuestion() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      quizId: _quizId,
      text,
      options,
      answerIndex,
    }: {
      id: QuestionId;
      quizId: bigint;
      text: string | null;
      options: string[] | null;
      answerIndex: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateQuestion(id, text, options, answerIndex);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["questions", vars.quizId.toString()] });
      qc.invalidateQueries({
        queryKey: ["questionsWithAnswers", vars.quizId.toString()],
      });
    },
  });
}

export function useDeleteQuestion() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      quizId: _quizId,
    }: { id: QuestionId; quizId: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteQuestion(id);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["questions", vars.quizId.toString()] });
      qc.invalidateQueries({
        queryKey: ["questionsWithAnswers", vars.quizId.toString()],
      });
    },
  });
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export function useListNotes(courseId?: bigint) {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["notes", courseId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNotes(courseId ?? null);
    },
    enabled: ready,
  });
}

export function useCreateNote() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      title,
      content,
    }: {
      courseId: bigint | null;
      title: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createNote(courseId, title, content);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useUpdateNote() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
    }: {
      id: NoteId;
      title: string | null;
      content: string | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateNote(id, title, content);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteNote() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: NoteId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteNote(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export function useListAssignments(courseId?: bigint) {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["assignments", courseId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAssignments(courseId ?? null);
    },
    enabled: ready,
  });
}

export function useCreateAssignment() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      title,
      description,
      dueDate,
      maxPoints,
    }: {
      courseId: bigint | null;
      title: string;
      description: string;
      dueDate: bigint | null;
      maxPoints: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createAssignment(
        courseId,
        title,
        description,
        dueDate,
        maxPoints,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

export function useUpdateAssignment() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      dueDate,
      maxPoints,
    }: {
      id: AssignmentId;
      title: string | null;
      description: string | null;
      dueDate: bigint | null;
      maxPoints: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateAssignment(id, title, description, dueDate, maxPoints);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

export function useDeleteAssignment() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: AssignmentId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteAssignment(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

// ─── Announcements ────────────────────────────────────────────────────────────

export function useListAnnouncements() {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAnnouncements();
    },
    enabled: ready,
  });
}

export function useCreateAnnouncement() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      message,
    }: { title: string; message: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createAnnouncement(title, message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useUpdateAnnouncement() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      message,
    }: {
      id: bigint;
      title: string | null;
      message: string | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateAnnouncement(id, title, message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useDeleteAnnouncement() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteAnnouncement(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useMarkAnnouncementRead() {
  const { actor } = useActorReady();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.markAnnouncementRead(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

// ─── Admin: Stats & Performance ───────────────────────────────────────────────

export function useAdminStats() {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAdminStats();
    },
    enabled: ready,
  });
}

export function useListStudentPerformances() {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["studentPerformances"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStudentPerformances();
    },
    enabled: ready,
  });
}

export function useMyPerformance() {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["myPerformance"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyPerformance();
    },
    enabled: ready,
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useMyProfile() {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: ready,
  });
}

export function useListUsers() {
  const { actor, ready } = useActorReady();
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUsers();
    },
    enabled: ready,
  });
}

// ─── Schedules ────────────────────────────────────────────────────────────────

interface ScheduleSlotPublic {
  id: bigint;
  className: string;
  day: string;
  timeSlot: string;
  timeRange: string;
  subject: string;
  teacher: string;
  isActive: boolean;
  createdAt: bigint;
}

interface ScheduleInput {
  className: string;
  day: string;
  timeSlot: string;
  timeRange: string;
  subject: string;
  teacher: string;
}

type ScheduleActor = {
  listScheduleSlots: () => Promise<ScheduleSlotPublic[]>;
  listScheduleSlotsByClass: (
    className: string,
  ) => Promise<ScheduleSlotPublic[]>;
  createScheduleSlot: (
    input: ScheduleInput,
  ) => Promise<
    | { __kind__: "ok"; ok: ScheduleSlotPublic }
    | { __kind__: "err"; err: string }
  >;
  updateScheduleSlot: (
    id: bigint,
    input: ScheduleInput,
  ) => Promise<
    { __kind__: "ok"; ok: boolean } | { __kind__: "err"; err: string }
  >;
  deleteScheduleSlot: (
    id: bigint,
  ) => Promise<
    { __kind__: "ok"; ok: boolean } | { __kind__: "err"; err: string }
  >;
};

function useScheduleActor() {
  const { actor, isFetching } = useActor(createActor);
  return {
    actor: actor as unknown as ScheduleActor | null,
    ready: !!actor && !isFetching,
  };
}

export function useListScheduleSlots() {
  const { actor, ready } = useScheduleActor();
  return useQuery({
    queryKey: ["scheduleSlots"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listScheduleSlots();
    },
    enabled: ready,
  });
}

export function useListScheduleSlotsByClass(className: string) {
  const { actor, ready } = useScheduleActor();
  return useQuery({
    queryKey: ["scheduleSlots", className],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listScheduleSlotsByClass(className);
    },
    enabled: ready,
  });
}

export function useCreateScheduleSlot() {
  const { actor } = useScheduleActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ScheduleInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createScheduleSlot(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduleSlots"] });
    },
  });
}

export function useUpdateScheduleSlot() {
  const { actor } = useScheduleActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: ScheduleInput }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateScheduleSlot(id, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduleSlots"] });
    },
  });
}

export function useDeleteScheduleSlot() {
  const { actor } = useScheduleActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteScheduleSlot(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduleSlots"] });
    },
  });
}
