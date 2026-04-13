export type UserRole = "admin" | "student";

export interface UserProfile {
  id: string;
  principal: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: bigint;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  createdBy: string;
  createdAt: bigint;
  updatedAt: bigint;
  isPublished: boolean;
  lessonCount: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl: string;
  order: number;
  duration: number;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  options: string[];
  correctAnswer?: number;
  order: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  createdAt: bigint;
  questionCount: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: number[];
  score: number;
  passed: boolean;
  startedAt: bigint;
  completedAt: bigint;
}

export interface Note {
  id: string;
  courseId: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: bigint;
  maxScore: number;
  createdAt: bigint;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: bigint;
  isRead?: boolean;
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  quizzesTaken: number;
  averageScore: number;
  lastActive: bigint;
}

export interface AdminStats {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  totalQuizAttempts: number;
  averageCompletionRate: number;
}

export interface Enrollment {
  courseId: string;
  studentId: string;
  enrolledAt: bigint;
  progress: number;
}

export interface ScheduleSlot {
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

export interface ScheduleInput {
  className: string;
  day: string;
  timeSlot: string;
  timeRange: string;
  subject: string;
  teacher: string;
}
