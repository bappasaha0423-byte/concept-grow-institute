import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Award,
  BarChart3,
  BellRing,
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  TrendingUp,
  Users,
} from "lucide-react";
import type { AnnouncementPublic } from "../../backend.d.ts";
import {
  useAdminStats,
  useListAnnouncements,
  useListCourses,
  useListStudentPerformances,
} from "../../hooks/useBackend";
import type { Announcement } from "../../types";

const statCards = [
  {
    label: "Total Students",
    icon: Users,
    key: "totalStudents",
    color: "text-accent",
    bg: "bg-accent/10",
    href: "/admin/students",
  },
  {
    label: "Total Courses",
    icon: BookOpen,
    key: "totalCourses",
    color: "text-primary",
    bg: "bg-primary/10",
    href: "/admin/courses",
  },
  {
    label: "Enrollments",
    icon: TrendingUp,
    key: "totalEnrollments",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    href: "/admin/analytics",
  },
  {
    label: "Quiz Attempts",
    icon: Award,
    key: "totalQuizAttempts",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    href: "/admin/analytics",
  },
];

const quickLinks = [
  {
    icon: BookOpen,
    label: "Create New Course",
    href: "/admin/courses",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Users,
    label: "Manage Students",
    href: "/admin/students",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: BarChart3,
    label: "View Analytics",
    href: "/admin/analytics",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
  {
    icon: BellRing,
    label: "Send Announcement",
    href: "/admin/announcements",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
  },
];

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: announcements, isLoading: annLoading } = useListAnnouncements();
  const { data: courses } = useListCourses();
  const { data: performances } = useListStudentPerformances();

  const recentAnnouncements =
    (announcements as AnnouncementPublic[] | undefined)?.slice(0, 4) ?? [];

  // Derive stats not provided by backend
  const totalCourses = courses?.length ?? 0;
  const totalQuizAttempts = performances
    ? performances.reduce((sum, p) => sum + Number(p.quizzesTaken), 0)
    : 0;
  const backendStats = stats as {
    totalStudents: bigint;
    totalEnrollments: bigint;
  } | null;
  const averageCompletionRate =
    performances && performances.length > 0
      ? performances.reduce((sum, p) => {
          const rate =
            Number(p.totalEnrollments) > 0
              ? (Number(p.completedLessons) / Number(p.totalEnrollments)) * 100
              : 0;
          return sum + rate;
        }, 0) / performances.length
      : 0;

  const derivedStats: Record<string, number> = {
    totalStudents: Number(backendStats?.totalStudents ?? 0n),
    totalCourses,
    totalEnrollments: Number(backendStats?.totalEnrollments ?? 0n),
    totalQuizAttempts,
  };

  return (
    <div className="p-6 space-y-8" data-ocid="admin-dashboard">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Overview of Concept Grow Institute
          </p>
        </div>
        <Badge variant="secondary" className="hidden sm:flex">
          Admin View
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.key} to={card.href}>
            <Card className="border-border hover:shadow-md transition-smooth cursor-pointer group">
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
                  <p className="text-3xl font-display font-bold text-foreground">
                    {derivedStats[card.key] ?? 0}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {quickLinks.map((action, i) => (
              <div key={action.label}>
                <Link
                  to={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-smooth"
                  data-ocid={`admin-quick-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center shrink-0`}
                  >
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">
                    {action.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
                {i < quickLinks.length - 1 && <Separator className="mt-2" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-display">
              Recent Announcements
            </CardTitle>
            <Link to="/admin/announcements">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {annLoading ? (
              <div className="space-y-3">
                {["a1", "a2", "a3"].map((k) => (
                  <Skeleton key={k} className="h-14 w-full" />
                ))}
              </div>
            ) : recentAnnouncements.length === 0 ? (
              <div className="text-center py-8">
                <BellRing className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  No announcements yet.
                </p>
                <Link to="/admin/announcements">
                  <Button variant="outline" size="sm" className="mt-3">
                    Create First Announcement
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnnouncements.map((ann, i) => (
                  <div key={ann.id.toString()}>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {ann.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {ann.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(ann.createdAt)}
                        </p>
                      </div>
                    </div>
                    {i < recentAnnouncements.length - 1 && (
                      <Separator className="mt-3" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            Institute At a Glance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {statsLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Average Course Completion Rate
                </span>
                <span className="text-sm font-bold text-foreground font-display">
                  {averageCompletionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-2.5 rounded-full bg-primary transition-smooth"
                  style={{
                    width: `${averageCompletionRate}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Average course completion rate across all enrolled students.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
