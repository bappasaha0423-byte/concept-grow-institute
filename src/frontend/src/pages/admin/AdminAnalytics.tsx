import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, BarChart3, BookOpen, TrendingUp, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StudentPerformance } from "../../backend.d.ts";
import {
  useAdminStats,
  useListStudentPerformances,
} from "../../hooks/useBackend";

interface AdminStatsShape {
  totalStudents: number;
  totalCourses: number;
  totalQuizAttempts: number;
  averageCompletionRate: number;
}

const BAR_COLORS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export default function AdminAnalytics() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: performances, isLoading: perfLoading } =
    useListStudentPerformances();

  const typedStats = stats as AdminStatsShape | null;
  const typedPerf = (performances as StudentPerformance[] | undefined) ?? [];

  // Build chart data: top 8 students by quizzes taken
  const chartData = [...typedPerf]
    .sort((a, b) => Number(b.quizzesTaken) - Number(a.quizzesTaken))
    .slice(0, 8)
    .map((p) => ({
      name: p.studentName.split(" ")[0],
      quizzes: Number(p.quizzesTaken),
      score: Math.round(p.averageQuizScore),
    }));

  const statCards = [
    {
      label: "Total Students",
      value: typedStats?.totalStudents ?? 0,
      icon: Users,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Total Courses",
      value: typedStats?.totalCourses ?? 0,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Quiz Attempts",
      value: typedStats?.totalQuizAttempts ?? 0,
      icon: Award,
      color: "text-chart-5",
      bg: "bg-chart-5/10",
    },
    {
      label: "Avg Completion",
      value: typedStats
        ? `${typedStats.averageCompletionRate.toFixed(1)}%`
        : "0%",
      icon: TrendingUp,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
  ];

  return (
    <div className="p-6 space-y-8" data-ocid="admin-analytics">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-chart-3" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Institute-wide performance overview
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {card.label}
              </CardTitle>
              <div
                className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}
              >
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {statsLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <p className={`text-3xl font-display font-bold ${card.color}`}>
                  {card.value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar Chart */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-display">
            Quiz Attempts by Student
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Top 8 students ranked by quiz attempts
          </p>
        </CardHeader>
        <CardContent>
          {perfLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48">
              <BarChart3 className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No quiz data available yet.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                    color: "hsl(var(--foreground))",
                  }}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
                />
                <Bar
                  dataKey="quizzes"
                  radius={[4, 4, 0, 0]}
                  name="Quiz Attempts"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={BAR_COLORS[index % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Performance Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-display">
            Student Performance
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Detailed breakdown of each student's progress
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {perfLoading ? (
            <div className="space-y-0 px-6 pb-4">
              {["p1", "p2", "p3", "p4"].map((k) => (
                <div
                  key={k}
                  className="py-3 border-b border-border last:border-0"
                >
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : typedPerf.length === 0 ? (
            <div className="text-center py-16">
              <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No performance data available yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Student
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Enrolled
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                      Lessons Done
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                      Quizzes
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Avg Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {typedPerf.map((perf, i) => (
                    <tr
                      key={perf.studentId.toText()}
                      className={`border-b border-border last:border-0 hover:bg-muted/30 transition-smooth ${
                        i % 2 === 0 ? "" : "bg-muted/10"
                      }`}
                      data-ocid={`perf-row-${perf.studentId.toText()}`}
                    >
                      <td className="py-3 px-6 font-medium text-foreground">
                        {perf.studentName}
                      </td>
                      <td className="py-3 px-4 text-right font-display font-semibold text-foreground">
                        {Number(perf.totalEnrollments)}
                      </td>
                      <td className="py-3 px-4 text-right font-display font-semibold text-foreground hidden md:table-cell">
                        {Number(perf.completedLessons)}
                      </td>
                      <td className="py-3 px-4 text-right font-display font-semibold text-foreground hidden sm:table-cell">
                        {Number(perf.quizzesTaken)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge
                          variant="outline"
                          className={
                            perf.averageQuizScore >= 75
                              ? "border-chart-3/40 bg-chart-3/10 text-chart-3"
                              : perf.averageQuizScore >= 50
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-destructive/40 bg-destructive/10 text-destructive"
                          }
                        >
                          {perf.averageQuizScore.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
