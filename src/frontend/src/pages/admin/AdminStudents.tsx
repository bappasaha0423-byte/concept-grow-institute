import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award,
  BookOpen,
  CalendarDays,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { StudentPerformance, UserProfilePublic } from "../../backend";
import { Role } from "../../backend";
import {
  useListStudentPerformances,
  useListUsers,
} from "../../hooks/useBackend";

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface StudentDetailProps {
  user: UserProfilePublic;
  perf?: StudentPerformance;
  onClose: () => void;
}

function StudentDetail({ user, perf, onClose }: StudentDetailProps) {
  const stats = [
    {
      label: "Courses Enrolled",
      value: perf ? Number(perf.totalEnrollments) : 0,
      icon: BookOpen,
      color: "text-primary",
    },
    {
      label: "Lessons Completed",
      value: perf ? Number(perf.completedLessons) : 0,
      icon: TrendingUp,
      color: "text-chart-3",
    },
    {
      label: "Quizzes Taken",
      value: perf ? Number(perf.quizzesTaken) : 0,
      icon: Award,
      color: "text-chart-5",
    },
    {
      label: "Average Score",
      value: perf ? `${perf.averageQuizScore.toFixed(1)}%` : "—",
      icon: Award,
      color: "text-accent",
    },
  ];

  return (
    <DialogContent className="max-w-md" data-ocid="student-detail-panel">
      <DialogHeader>
        <DialogTitle className="font-display">Student Profile</DialogTitle>
      </DialogHeader>
      <div className="space-y-5">
        {/* Avatar + Info */}
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14">
            <AvatarFallback className="bg-accent/10 text-accent font-display text-lg font-bold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-foreground text-lg truncate">
              {user.name}
            </p>
            <Badge variant="outline" className="mt-1 text-xs capitalize">
              {user.role}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Separator />

        {/* Enrollment date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span>Joined {formatDate(user.createdAt)}</span>
        </div>

        {/* Performance Stats */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Performance Summary
          </p>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-muted/40 rounded-lg p-3 space-y-1"
              >
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-display font-bold ${s.color}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default function AdminStudents() {
  const { data: users, isLoading: usersLoading } = useListUsers();
  const { data: performances } = useListStudentPerformances();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserProfilePublic | null>(null);

  const students = useMemo(() => {
    const all = (users as UserProfilePublic[] | undefined) ?? [];
    return all.filter((u) => u.role === Role.student);
  }, [users]);

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter((u) => u.name.toLowerCase().includes(q));
  }, [students, search]);

  const perfMap = useMemo(() => {
    const map = new Map<string, StudentPerformance>();
    for (const p of (performances as StudentPerformance[] | undefined) ?? []) {
      map.set(p.studentId.toText(), p);
    }
    return map;
  }, [performances]);

  const selectedPerf = selected ? perfMap.get(selected.id.toText()) : undefined;

  return (
    <div className="p-6 space-y-6" data-ocid="admin-students">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Students
            </h1>
            <p className="text-sm text-muted-foreground">
              {students.length} registered student
              {students.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-ocid="student-search"
        />
      </div>

      {/* Table */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">All Students</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          {usersLoading ? (
            <div className="space-y-0 px-6 pb-4">
              {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                <div
                  key={k}
                  className="py-3 border-b border-border last:border-0"
                >
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">
                {search
                  ? "No students match your search"
                  : "No students registered yet"}
              </p>
              {search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                      Joined
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                      Enrolled
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                      Avg Score
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Status
                    </th>
                    <th className="py-3 px-6 w-24" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, i) => {
                    const perf = perfMap.get(user.id.toText());
                    return (
                      <tr
                        key={user.id.toText()}
                        className={`border-b border-border last:border-0 hover:bg-muted/30 transition-smooth ${
                          i % 2 === 0 ? "" : "bg-muted/10"
                        }`}
                        data-ocid={`student-row-${user.id.toText()}`}
                      >
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 shrink-0">
                              <AvatarFallback className="bg-accent/10 text-accent text-xs font-bold font-display">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono truncate">
                                {user.id.toText().slice(0, 20)}…
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right hidden sm:table-cell">
                          <span className="font-display font-semibold text-foreground">
                            {perf ? Number(perf.totalEnrollments) : 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right hidden lg:table-cell">
                          <span className="font-display font-semibold text-foreground">
                            {perf
                              ? `${perf.averageQuizScore.toFixed(1)}%`
                              : "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant="outline"
                            className="text-xs text-chart-3 border-chart-3/30 bg-chart-3/10"
                          >
                            Active
                          </Badge>
                        </td>
                        <td className="py-3 px-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => setSelected(user)}
                            data-ocid={`student-view-${user.id.toText()}`}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Detail Dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        {selected && (
          <StudentDetail
            user={selected}
            perf={selectedPerf}
            onClose={() => setSelected(null)}
          />
        )}
      </Dialog>
    </div>
  );
}
