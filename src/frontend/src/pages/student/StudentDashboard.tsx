import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Bell, BookOpen, ChevronRight, Star, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type {
  AnnouncementPublic,
  CoursePublic,
  QuizAttempt,
} from "../../backend.d.ts";
import { useAuth } from "../../hooks/useAuth";
import {
  useListAnnouncements,
  useListCourses,
  useListLessons,
  useMyAttempts,
  useMyCompletedLessons,
  useMyEnrollments,
  useMyPerformance,
} from "../../hooks/useBackend";

function CourseProgressRow({
  course,
  completedIds,
}: {
  course: CoursePublic;
  completedIds: Set<bigint>;
}) {
  const { data: lessons } = useListLessons(course.id);
  const totalLessons = lessons?.length ?? 0;
  const completedCount = lessons
    ? lessons.filter((l) => completedIds.has(l.id)).length
    : 0;
  const pct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <Link
      key={Number(course.id)}
      to="/student/courses/$courseId"
      params={{ courseId: course.id.toString() }}
      data-ocid={`dashboard-course-${Number(course.id)}`}
      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-smooth group"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <BookOpen className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {course.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {pct}%
          </span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-smooth" />
    </Link>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: enrolledIds, isLoading: loadingEnrollments } =
    useMyEnrollments();
  const { data: attempts, isLoading: loadingAttempts } = useMyAttempts();
  const { data: announcements, isLoading: loadingAnnouncements } =
    useListAnnouncements();
  const { data: courses } = useListCourses();
  const { data: performance } = useMyPerformance();
  const { data: completedLessonIds } = useMyCompletedLessons();

  const completedIdSet = new Set((completedLessonIds ?? []) as bigint[]);
  const enrolledSet = new Set((enrolledIds ?? []) as bigint[]);
  const enrolledCourses = ((courses ?? []) as CoursePublic[]).filter((c) =>
    enrolledSet.has(c.id),
  );
  const unreadCount = ((announcements ?? []) as AnnouncementPublic[]).filter(
    (a) => !a.isRead,
  ).length;
  const perf = performance as { averageQuizScore?: number } | null;
  const avgScore = perf?.averageQuizScore ?? 0;
  const attemptList = (attempts ?? []) as QuizAttempt[];

  const statCards = [
    {
      icon: BookOpen,
      label: "Enrolled Courses",
      value: enrolledSet.size,
      loading: loadingEnrollments,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      href: "/student/courses",
    },
    {
      icon: Trophy,
      label: "Quizzes Taken",
      value: attemptList.length,
      loading: loadingAttempts,
      colorClass: "text-accent",
      bgClass: "bg-accent/10",
      href: "/student/quizzes",
    },
    {
      icon: Star,
      label: "Avg. Quiz Score",
      value: `${avgScore.toFixed(0)}%`,
      loading: false,
      colorClass: "text-chart-5",
      bgClass: "bg-chart-5/10",
      href: "/student/scores",
    },
    {
      icon: Bell,
      label: "Unread Alerts",
      value: unreadCount,
      loading: loadingAnnouncements,
      colorClass: "text-chart-2",
      bgClass: "bg-chart-2/10",
      href: "/student/notifications",
    },
  ];

  return (
    <div className="p-6 space-y-8" data-ocid="student-dashboard">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 border border-border p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
              Welcome back
            </p>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {user?.name ?? "Student"} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Keep up the great work — every lesson brings you closer to your
              goal.
            </p>
          </div>
          <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-primary flex-shrink-0 items-center justify-center shadow-lg">
            <span className="text-xl font-display font-bold text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase() ?? "S"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Link
              to={stat.href}
              data-ocid={`stat-card-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Card className="border-border hover:shadow-md transition-smooth cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                  <p className="text-xs font-medium text-muted-foreground truncate">
                    {stat.label}
                  </p>
                  <div
                    className={`w-7 h-7 rounded-lg ${stat.bgClass} flex items-center justify-center flex-shrink-0`}
                  >
                    <stat.icon className={`w-3.5 h-3.5 ${stat.colorClass}`} />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {stat.loading ? (
                    <Skeleton className="h-7 w-14" />
                  ) : (
                    <p className="text-2xl font-display font-bold text-foreground">
                      {stat.value}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Course progress + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Card className="border-border h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-display">
                  Continue Learning
                </CardTitle>
              </div>
              <Link
                to="/student/courses"
                className="text-xs text-primary hover:underline font-medium"
                data-ocid="dashboard-courses-link"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {loadingEnrollments ? (
                <div className="space-y-4">
                  {["e1", "e2"].map((k) => (
                    <Skeleton key={k} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : !enrolledCourses.length ? (
                <div className="text-center py-10">
                  <BookOpen className="w-9 h-9 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No courses enrolled yet.
                  </p>
                  <Link
                    to="/student/courses"
                    className="text-sm font-semibold text-primary hover:underline"
                    data-ocid="dashboard-browse-courses-cta"
                  >
                    Browse courses →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrolledCourses.slice(0, 4).map((c) => (
                    <CourseProgressRow
                      key={Number(c.id)}
                      course={c}
                      completedIds={completedIdSet}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-border h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-display">
                  Announcements
                </CardTitle>
                {unreadCount > 0 && (
                  <Badge
                    className="bg-primary text-primary-foreground text-xs px-1.5 h-4"
                    data-ocid="dashboard-unread-badge"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <Link
                to="/student/notifications"
                className="text-xs text-primary hover:underline font-medium"
                data-ocid="dashboard-notifications-link"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {loadingAnnouncements ? (
                <div className="space-y-3">
                  {["a1", "a2", "a3"].map((k) => (
                    <Skeleton key={k} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : !announcements?.length ? (
                <div className="text-center py-10">
                  <Bell className="w-9 h-9 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No announcements yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {((announcements ?? []) as AnnouncementPublic[])
                    .slice(0, 4)
                    .map((ann) => (
                      <Link
                        key={Number(ann.id)}
                        to="/student/notifications"
                        data-ocid={`dashboard-ann-${Number(ann.id)}`}
                        className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-smooth"
                      >
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ann.isRead ? "bg-muted-foreground" : "bg-primary"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${ann.isRead ? "text-muted-foreground" : "text-foreground"}`}
                          >
                            {ann.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {ann.message}
                          </p>
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent attempts */}
      {attemptList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                <CardTitle className="text-base font-display">
                  Recent Quiz Results
                </CardTitle>
              </div>
              <Link
                to="/student/scores"
                className="text-xs text-primary hover:underline font-medium"
                data-ocid="dashboard-scores-link"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attemptList.slice(0, 3).map((attempt) => {
                  const pct =
                    attempt.total > 0n
                      ? Math.round(
                          (Number(attempt.score) / Number(attempt.total)) * 100,
                        )
                      : 0;
                  return (
                    <div
                      key={Number(attempt.id)}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                      data-ocid={`dashboard-attempt-${Number(attempt.id)}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/15">
                          <Trophy className="w-3.5 h-3.5 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Quiz Attempt
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              Number(attempt.submittedAt) / 1_000_000,
                            ).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <Badge className="text-xs bg-accent/15 text-accent border-0">
                        {pct}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
