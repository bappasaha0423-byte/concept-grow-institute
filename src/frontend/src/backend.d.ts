import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StudentPerformance {
    totalEnrollments: bigint;
    studentId: UserId;
    studentName: string;
    averageQuizScore: number;
    completedLessons: bigint;
    quizzesTaken: bigint;
}
export type Timestamp = bigint;
export interface ScheduleInput {
    day: string;
    subject: string;
    teacher: string;
    timeRange: string;
    className: string;
    timeSlot: string;
}
export type Result_2 = {
    __kind__: "ok";
    ok: UserProfilePublic;
} | {
    __kind__: "err";
    err: string;
};
export interface QuestionPublic {
    id: QuestionId;
    text: string;
    quizId: QuizId;
    options: Array<string>;
}
export interface QuizPublic {
    id: QuizId;
    title: string;
    createdAt: Timestamp;
    createdBy: UserId;
    description: string;
    courseId: CourseId;
}
export interface AssignmentPublic {
    id: AssignmentId;
    title: string;
    maxPoints: bigint;
    createdAt: Timestamp;
    createdBy: UserId;
    dueDate?: Timestamp;
    description: string;
    courseId?: CourseId;
}
export type Result_5 = {
    __kind__: "ok";
    ok: QuizPublic;
} | {
    __kind__: "err";
    err: string;
};
export type Result_1 = {
    __kind__: "ok";
    ok: QuizAttempt;
} | {
    __kind__: "err";
    err: string;
};
export type Result_4 = {
    __kind__: "ok";
    ok: ScheduleSlotPublic;
} | {
    __kind__: "err";
    err: string;
};
export type Result_11 = {
    __kind__: "ok";
    ok: AnnouncementPublic;
} | {
    __kind__: "err";
    err: string;
};
export interface QuizAttempt {
    id: bigint;
    total: bigint;
    studentId: UserId;
    answers: Array<bigint>;
    submittedAt: Timestamp;
    score: bigint;
    quizId: QuizId;
}
export type CourseId = bigint;
export type Result_7 = {
    __kind__: "ok";
    ok: NotePublic;
} | {
    __kind__: "err";
    err: string;
};
export type AssignmentId = bigint;
export interface ScheduleSlotPublic {
    id: ScheduleId;
    day: string;
    subject: string;
    createdAt: Timestamp;
    teacher: string;
    isActive: boolean;
    timeRange: string;
    className: string;
    timeSlot: string;
}
export interface NotePublic {
    id: NoteId;
    title: string;
    content: string;
    createdAt: Timestamp;
    createdBy: UserId;
    updatedAt: Timestamp;
    courseId?: CourseId;
}
export type NoteId = bigint;
export interface CoursePublic {
    id: CourseId;
    title: string;
    published: boolean;
    createdAt: Timestamp;
    createdBy: UserId;
    description: string;
    category: string;
}
export type Result_6 = {
    __kind__: "ok";
    ok: QuestionPublic;
} | {
    __kind__: "err";
    err: string;
};
export type LessonId = bigint;
export interface AnnouncementPublic {
    id: AnnouncementId;
    title: string;
    createdAt: Timestamp;
    createdBy: UserId;
    isRead: boolean;
    message: string;
}
export type QuestionId = bigint;
export interface LessonPublic {
    id: LessonId;
    title: string;
    content: string;
    order: bigint;
    createdAt: Timestamp;
    courseId: CourseId;
}
export type Result_9 = {
    __kind__: "ok";
    ok: CoursePublic;
} | {
    __kind__: "err";
    err: string;
};
export interface UserProfilePublic {
    id: UserId;
    name: string;
    createdAt: Timestamp;
    role: Role;
}
export type UserId = Principal;
export type ScheduleId = bigint;
export type Result = {
    __kind__: "ok";
    ok: boolean;
} | {
    __kind__: "err";
    err: string;
};
export type Result_3 = {
    __kind__: "ok";
    ok: Array<QuestionWithAnswer>;
} | {
    __kind__: "err";
    err: string;
};
export type Result_10 = {
    __kind__: "ok";
    ok: AssignmentPublic;
} | {
    __kind__: "err";
    err: string;
};
export type Result_8 = {
    __kind__: "ok";
    ok: LessonPublic;
} | {
    __kind__: "err";
    err: string;
};
export type AnnouncementId = bigint;
export interface QuestionWithAnswer {
    id: QuestionId;
    answerIndex: bigint;
    text: string;
    quizId: QuizId;
    options: Array<string>;
}
export type QuizId = bigint;
export enum Role {
    admin = "admin",
    student = "student"
}
export interface backendInterface {
    createAnnouncement(title: string, message: string): Promise<Result_11>;
    createAssignment(courseId: CourseId | null, title: string, description: string, dueDate: Timestamp | null, maxPoints: bigint): Promise<Result_10>;
    createCourse(title: string, description: string, category: string): Promise<Result_9>;
    createLesson(courseId: CourseId, title: string, content: string, order: bigint): Promise<Result_8>;
    createNote(courseId: CourseId | null, title: string, content: string): Promise<Result_7>;
    createQuestion(quizId: QuizId, text: string, options: Array<string>, answerIndex: bigint): Promise<Result_6>;
    createQuiz(courseId: CourseId, title: string, description: string): Promise<Result_5>;
    createScheduleSlot(input: ScheduleInput): Promise<Result_4>;
    deleteAnnouncement(id: AnnouncementId): Promise<Result>;
    deleteAssignment(id: AssignmentId): Promise<Result>;
    deleteCourse(id: CourseId): Promise<Result>;
    deleteLesson(id: LessonId): Promise<Result>;
    deleteNote(id: NoteId): Promise<Result>;
    deleteQuestion(id: QuestionId): Promise<Result>;
    deleteQuiz(id: QuizId): Promise<Result>;
    deleteScheduleSlot(id: ScheduleId): Promise<Result>;
    enrollInCourse(courseId: CourseId): Promise<Result>;
    getAdminStats(): Promise<{
        totalEnrollments: bigint;
        totalStudents: bigint;
    }>;
    getAssignment(id: AssignmentId): Promise<AssignmentPublic | null>;
    getCourse(id: CourseId): Promise<CoursePublic | null>;
    getLesson(id: LessonId): Promise<LessonPublic | null>;
    getMyAttempts(quizId: QuizId | null): Promise<Array<QuizAttempt>>;
    getMyCompletedLessons(): Promise<Array<LessonId>>;
    getMyEnrollments(): Promise<Array<CourseId>>;
    getMyPerformance(): Promise<StudentPerformance | null>;
    getMyProfile(): Promise<UserProfilePublic | null>;
    getNote(id: NoteId): Promise<NotePublic | null>;
    getQuiz(id: QuizId): Promise<QuizPublic | null>;
    listAnnouncements(): Promise<Array<AnnouncementPublic>>;
    listAssignments(courseId: CourseId | null): Promise<Array<AssignmentPublic>>;
    listCourses(): Promise<Array<CoursePublic>>;
    listLessons(courseId: CourseId): Promise<Array<LessonPublic>>;
    listNotes(courseId: CourseId | null): Promise<Array<NotePublic>>;
    listQuestions(quizId: QuizId): Promise<Array<QuestionPublic>>;
    listQuestionsWithAnswers(quizId: QuizId): Promise<Result_3>;
    listQuizzes(courseId: CourseId): Promise<Array<QuizPublic>>;
    listScheduleSlots(): Promise<Array<ScheduleSlotPublic>>;
    listScheduleSlotsByClass(className: string): Promise<Array<ScheduleSlotPublic>>;
    listStudentPerformances(): Promise<Array<StudentPerformance>>;
    listUsers(): Promise<Array<UserProfilePublic>>;
    markAnnouncementRead(id: AnnouncementId): Promise<Result>;
    markLessonComplete(lessonId: LessonId): Promise<Result>;
    register(name: string): Promise<Result_2>;
    registerAsAdmin(name: string): Promise<Result_2>;
    submitQuizAttempt(quizId: QuizId, answers: Array<bigint>): Promise<Result_1>;
    updateAnnouncement(id: AnnouncementId, title: string | null, message: string | null): Promise<Result>;
    updateAssignment(id: AssignmentId, title: string | null, description: string | null, dueDate: Timestamp | null, maxPoints: bigint | null): Promise<Result>;
    updateCourse(id: CourseId, title: string | null, description: string | null, category: string | null, published: boolean | null): Promise<Result>;
    updateLesson(id: LessonId, title: string | null, content: string | null, order: bigint | null): Promise<Result>;
    updateNote(id: NoteId, title: string | null, content: string | null): Promise<Result>;
    updateQuestion(id: QuestionId, text: string | null, options: Array<string> | null, answerIndex: bigint | null): Promise<Result>;
    updateQuiz(id: QuizId, title: string | null, description: string | null): Promise<Result>;
    updateScheduleSlot(id: ScheduleId, input: ScheduleInput): Promise<Result>;
}
