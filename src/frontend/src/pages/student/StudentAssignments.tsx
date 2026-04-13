import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, ClipboardList, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { AssignmentPublic, CoursePublic } from "../../backend.d.ts";
import { useListAssignments, useListCourses } from "../../hooks/useBackend";

function dueDateLabel(dueDate: bigint | undefined): {
  label: string;
  variant: "default" | "destructive" | "outline";
} {
  if (!dueDate) return { label: "No due date", variant: "outline" };
  const due = new Date(Number(dueDate) / 1_000_000);
  const diffMs = due.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: "Overdue", variant: "destructive" };
  if (diffDays === 0) return { label: "Due today", variant: "destructive" };
  if (diffDays <= 3)
    return { label: `Due in ${diffDays}d`, variant: "default" };
  return {
    label: due.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    variant: "outline",
  };
}

export default function StudentAssignments() {
  const { data: assignments, isLoading } = useListAssignments();
  const { data: courses } = useListCourses();
  const [search, setSearch] = useState("");
  const [filterCourseId, setFilterCourseId] = useState<bigint | null>(null);
  const [expanded, setExpanded] = useState<bigint | null>(null);

  const courseMap = new Map(
    ((courses ?? []) as CoursePublic[]).map((c) => [c.id.toString(), c.title]),
  );
  const assignList = (assignments ?? []) as AssignmentPublic[];

  const filtered = assignList.filter((a) => {
    const matchSearch =
      !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchCourse = !filterCourseId || a.courseId === filterCourseId;
    return matchSearch && matchCourse;
  });

  const uniqueCourseIds = [
    ...new Set(assignList.map((a) => a.courseId).filter(Boolean)),
  ] as bigint[];

  return (
    <div className="p-6 space-y-5" data-ocid="student-assignments">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-chart-5/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-chart-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Assignments
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} assignment(s)
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="assignments-search"
          />
        </div>
      </div>

      {uniqueCourseIds.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          data-ocid="assignments-course-filter"
        >
          <button
            type="button"
            onClick={() => setFilterCourseId(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-smooth border ${!filterCourseId ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted/40"}`}
          >
            All Courses
          </button>
          {uniqueCourseIds.map((cid) => (
            <button
              key={cid.toString()}
              type="button"
              onClick={() =>
                setFilterCourseId(filterCourseId === cid ? null : cid)
              }
              className={`px-3 py-1 rounded-full text-xs font-medium transition-smooth border ${filterCourseId === cid ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted/40"}`}
            >
              {courseMap.get(cid.toString()) ?? cid.toString()}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {["a1", "a2", "a3"].map((k) => (
            <Skeleton key={k} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !filtered.length ? (
        <Card className="border-border">
          <CardContent className="py-20 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-display font-semibold text-foreground mb-1">
              {search || filterCourseId
                ? "No assignments match your filters"
                : "No assignments yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {search || filterCourseId
                ? "Try different filters."
                : "Your teachers haven't posted assignments yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((assignment, i) => {
            const { label: dueLabel, variant: dueVariant } = dueDateLabel(
              assignment.dueDate,
            );
            const isExpanded = expanded === assignment.id;
            return (
              <motion.div
                key={Number(assignment.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <Card
                  className={`border-border transition-smooth ${isExpanded ? "shadow-sm" : "hover:shadow-sm"}`}
                  data-ocid={`assignment-card-${Number(assignment.id)}`}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() =>
                      setExpanded(isExpanded ? null : assignment.id)
                    }
                    data-ocid={`assignment-toggle-${Number(assignment.id)}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-chart-5/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <ClipboardList className="w-4 h-4 text-chart-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-display font-semibold text-foreground">
                              {assignment.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {assignment.courseId && (
                                <span className="text-[11px] text-muted-foreground">
                                  {courseMap.get(
                                    assignment.courseId.toString(),
                                  ) ?? "Course"}
                                </span>
                              )}
                              <span className="text-muted-foreground/40">
                                ·
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {Number(assignment.maxPoints)} pts max
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={dueVariant}
                          className="text-[10px] gap-1 flex-shrink-0"
                        >
                          <CalendarDays className="w-2.5 h-2.5" />
                          {dueLabel}
                        </Badge>
                      </div>
                    </CardContent>
                  </button>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.25 }}
                      className="px-4 pb-4 border-t border-border pt-3"
                    >
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Description
                      </p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {assignment.description ?? "No description provided."}
                      </p>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                        {assignment.dueDate && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Due:{" "}
                            {new Date(
                              Number(assignment.dueDate) / 1_000_000,
                            ).toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Max marks:{" "}
                          <strong className="text-foreground">
                            {Number(assignment.maxPoints)}
                          </strong>
                        </span>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
