import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import type { QuizAttempt, QuizPublic } from "../../backend.d.ts";
import {
  useListAllQuizzes,
  useMyAttempts,
  useMyEnrollments,
  useMyPerformance,
} from "../../hooks/useBackend";

export default function StudentScores() {
  const { data: attempts, isLoading: loadingAttempts } = useMyAttempts();
  const { data: performance, isLoading: loadingPerf } = useMyPerformance();
  const { data: enrolledIds } = useMyEnrollments();
  const { data: quizzes } = useListAllQuizzes();

  const perf = performance as {
    averageQuizScore?: number;
    quizzesTaken?: bigint;
    completedLessons?: bigint;
    totalEnrollments?: bigint;
  } | null;

  const avgScore = perf?.averageQuizScore ?? 0;
  const quizzesTaken = Number(perf?.quizzesTaken ?? attempts?.length ?? 0);
  const enrollCount = Number(
    perf?.totalEnrollments ?? (enrolledIds ?? []).length,
  );

  const quizMap = new Map(
    ((quizzes ?? []) as QuizPublic[]).map((q) => [q.id.toString(), q.title]),
  );

  const sortedAttempts = [...((attempts ?? []) as QuizAttempt[])].sort(
    (a, b) => Number(b.submittedAt) - Number(a.submittedAt),
  );

  const statCards = [
    {
      icon: BookOpen,
      label: "Enrollments",
      value: enrollCount,
      loading: loadingPerf,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      icon: Trophy,
      label: "Quizzes Taken",
      value: quizzesTaken,
      loading: loadingPerf,
      colorClass: "text-accent",
      bgClass: "bg-accent/10",
    },
    {
      icon: TrendingUp,
      label: "Avg. Score",
      value: `${avgScore.toFixed(1)}%`,
      loading: loadingPerf,
      colorClass: "text-chart-2",
      bgClass: "bg-chart-2/10",
    },
    {
      icon: CheckCircle2,
      label: "Lessons Done",
      value: Number(perf?.completedLessons ?? 0),
      loading: loadingPerf,
      colorClass: "text-chart-3",
      bgClass: "bg-chart-3/10",
    },
  ];

  return (
    <div className="p-6 space-y-6" data-ocid="student-scores">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
          <Award className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            My Scores
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your personal performance overview
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
          >
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                <p className="text-xs font-medium text-muted-foreground">
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
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <p className="text-2xl font-display font-bold text-foreground">
                    {stat.value}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {!loadingPerf && avgScore > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-border bg-gradient-to-br from-accent/5 to-primary/5">
            <CardContent className="py-6 px-6">
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg
                    viewBox="0 0 36 36"
                    className="w-20 h-20 -rotate-90"
                    aria-label="Score gauge"
                  >
                    <title>Score gauge</title>
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-border"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      strokeWidth="3"
                      stroke="oklch(var(--accent))"
                      strokeDasharray={`${avgScore} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-display font-bold text-foreground">
                      {avgScore.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-display font-semibold text-foreground">
                    Overall Performance
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {avgScore >= 75
                      ? "Excellent! Keep it up 🌟"
                      : avgScore >= 50
                        ? "Good progress! Push a bit more 💪"
                        : "Keep practising — you'll improve! 📚"}
                  </p>
                  <Badge
                    className={`mt-2 text-[10px] ${avgScore >= 75 ? "bg-accent/15 text-accent border-0" : avgScore >= 50 ? "bg-primary/15 text-primary border-0" : "bg-muted text-muted-foreground border-0"}`}
                  >
                    {avgScore >= 75
                      ? "High Achiever"
                      : avgScore >= 50
                        ? "On Track"
                        : "Needs Practice"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="border-border" data-ocid="quiz-history-table">
        <CardHeader>
          <CardTitle className="text-base font-display">
            Quiz Attempt History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingAttempts ? (
            <div className="space-y-2 p-4">
              {["a1", "a2", "a3", "a4"].map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : !sortedAttempts.length ? (
            <div className="text-center py-14 px-4">
              <Award className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="font-display font-semibold text-foreground mb-1">
                No attempts yet
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Take your first quiz to see your scores here.
              </p>
              <Link
                to="/student/quizzes"
                className="text-sm font-semibold text-primary hover:underline"
                data-ocid="scores-take-quiz-cta"
              >
                Go to Quizzes →
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAttempts.map((att) => {
                  const pct =
                    att.total > 0n
                      ? Math.round(
                          (Number(att.score) / Number(att.total)) * 100,
                        )
                      : 0;
                  const passed = pct >= 60;
                  return (
                    <TableRow
                      key={Number(att.id)}
                      data-ocid={`score-row-${Number(att.id)}`}
                    >
                      <TableCell className="font-medium text-sm">
                        {quizMap.get(att.quizId.toString()) ?? "Quiz"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(
                          Number(att.submittedAt) / 1_000_000,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right font-display font-bold text-foreground">
                        {pct}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className={`text-xs ${passed ? "bg-accent/15 text-accent border-0" : "bg-destructive/15 text-destructive border-0"}`}
                        >
                          {passed ? "Passed" : "Failed"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
