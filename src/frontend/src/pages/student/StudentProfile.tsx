import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  GraduationCap,
  LogOut,
  Shield,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../../hooks/useAuth";
import {
  useMyAttempts,
  useMyEnrollments,
  useMyPerformance,
} from "../../hooks/useBackend";

export default function StudentProfile() {
  const { user, logout } = useAuth();
  const { data: enrolledIds, isLoading: loadingEnrollments } =
    useMyEnrollments();
  const { data: attempts, isLoading: loadingAttempts } = useMyAttempts();
  const { data: performance, isLoading: loadingPerf } = useMyPerformance();

  const perf = performance as {
    averageQuizScore?: number;
    quizzesTaken?: bigint;
    completedLessons?: bigint;
  } | null;
  const avgScore = perf?.averageQuizScore ?? 0;
  const quizzesTaken = Number(perf?.quizzesTaken ?? attempts?.length ?? 0);
  const enrollCount = (enrolledIds ?? []).length;

  const initials =
    user?.name
      ?.split(" ")
      .slice(0, 2)
      .map((n) => n.charAt(0).toUpperCase())
      .join("") ?? "S";

  const stats = [
    {
      icon: BookOpen,
      label: "Courses Enrolled",
      value: enrollCount,
      loading: loadingEnrollments,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      icon: Trophy,
      label: "Quizzes Taken",
      value: quizzesTaken,
      loading: loadingAttempts,
      colorClass: "text-accent",
      bgClass: "bg-accent/10",
    },
    {
      icon: TrendingUp,
      label: "Avg. Score",
      value: `${avgScore.toFixed(0)}%`,
      loading: loadingPerf,
      colorClass: "text-chart-2",
      bgClass: "bg-chart-2/10",
    },
    {
      icon: GraduationCap,
      label: "Lessons Done",
      value: Number(perf?.completedLessons ?? 0),
      loading: loadingPerf,
      colorClass: "text-chart-3",
      bgClass: "bg-chart-3/10",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-2xl" data-ocid="student-profile">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/30 via-primary/20 to-accent/20" />
          <CardContent className="pt-0 pb-5 px-5">
            <div className="-mt-8 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-primary border-4 border-card flex items-center justify-center shadow-md">
                <span className="text-xl font-display font-bold text-primary-foreground">
                  {initials}
                </span>
              </div>
            </div>
            <div className="space-y-1 mb-3">
              <h2 className="text-lg font-display font-bold text-foreground">
                {user?.name ?? "Student"}
              </h2>
              <Badge className="bg-primary/10 text-primary border-0 gap-1 text-xs">
                <GraduationCap className="w-3 h-3" /> Student
              </Badge>
            </div>
            <Separator className="my-3" />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Internet Identity
                </p>
              </div>
              <p className="text-xs font-mono text-foreground break-all bg-muted/40 rounded-md px-2.5 py-1.5 border border-border">
                {user?.principal ?? "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-display">
              Learning Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${stat.bgClass} flex items-center justify-center flex-shrink-0`}
                  >
                    <stat.icon className={`w-4 h-4 ${stat.colorClass}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground truncate">
                      {stat.label}
                    </p>
                    {stat.loading ? (
                      <Skeleton className="h-5 w-8 mt-0.5" />
                    ) : (
                      <p className="text-sm font-display font-bold text-foreground">
                        {stat.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-border">
          <CardContent className="py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Sign Out
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You'll need to log in again with Internet Identity.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={logout}
                className="gap-2 flex-shrink-0"
                data-ocid="profile-signout"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
