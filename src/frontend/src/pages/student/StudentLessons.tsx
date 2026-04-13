import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ChevronLeft, FileText, PlayCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { LessonPublic } from "../../backend.d.ts";
import {
  useListLessons,
  useMarkLessonComplete,
  useMyCompletedLessons,
} from "../../hooks/useBackend";

interface StudentLessonsProps {
  courseId: string;
  courseTitle?: string;
  onBack?: () => void;
}

export default function StudentLessons({
  courseId,
  courseTitle,
  onBack,
}: StudentLessonsProps) {
  const courseIdBig = BigInt(courseId || "0");
  const { data: lessons, isLoading } = useListLessons(courseIdBig);
  const { data: completedIds } = useMyCompletedLessons();
  const { mutate: markComplete, isPending: marking } = useMarkLessonComplete();
  const [selected, setSelected] = useState<LessonPublic | null>(null);
  const [markingId, setMarkingId] = useState<bigint | null>(null);

  // completedIds is bigint[] (LessonId[])
  const completedSet = new Set((completedIds ?? []) as bigint[]);
  const sorted = [...((lessons ?? []) as LessonPublic[])].sort(
    (a, b) => Number(a.order) - Number(b.order),
  );

  const completedCount = sorted.filter((l) => completedSet.has(l.id)).length;
  const total = sorted.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  function handleMarkComplete(id: bigint) {
    setMarkingId(id);
    markComplete(id, { onSettled: () => setMarkingId(null) });
  }

  return (
    <div className="p-6 space-y-6" data-ocid="student-lessons">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-smooth"
            aria-label="Back to courses"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-display font-bold text-foreground truncate">
            {courseTitle ?? "Course Lessons"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completedCount} of {total} completed
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border-0 text-xs">
          {pct}%
        </Badge>
      </div>

      <div className="space-y-1.5">
        <Progress value={pct} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {pct < 100 ? `${100 - pct}% remaining` : "Course completed! 🎉"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Lesson list */}
        <div className="lg:col-span-2 space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {["l1", "l2", "l3", "l4"].map((k) => (
                <Skeleton key={k} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : !sorted.length ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No lessons published yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            sorted.map((lesson, i) => {
              const done = completedSet.has(lesson.id);
              const active = selected?.id === lesson.id;
              return (
                <motion.button
                  key={Number(lesson.id)}
                  type="button"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() =>
                    setSelected(lesson.id === selected?.id ? null : lesson)
                  }
                  data-ocid={`lesson-item-${Number(lesson.id)}`}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-smooth ${
                    active
                      ? "border-primary bg-primary/8 shadow-sm"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      done
                        ? "bg-accent/15"
                        : active
                          ? "bg-primary/15"
                          : "bg-muted"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    ) : (
                      <PlayCircle
                        className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${active ? "text-primary" : "text-foreground"}`}
                    >
                      {lesson.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Lesson {Number(lesson.order)}
                    </p>
                  </div>
                  {done && (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-accent border-accent/30 flex-shrink-0"
                    >
                      Done
                    </Badge>
                  )}
                </motion.button>
              );
            })
          )}
        </div>

        {/* Lesson content */}
        <div className="lg:col-span-3">
          {!selected ? (
            <Card className="border-border h-full">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] py-16">
                <PlayCircle className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="font-display font-semibold text-foreground mb-1">
                  Select a lesson
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  Click any lesson to start reading.
                </p>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              key={Number(selected.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border">
                <CardHeader className="border-b border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="font-display text-lg">
                        {selected.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Lesson {Number(selected.order)}
                      </p>
                    </div>
                    {completedSet.has(selected.id) ? (
                      <Badge className="bg-accent/15 text-accent border-0 gap-1 flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleMarkComplete(selected.id)}
                        disabled={marking && markingId === selected.id}
                        data-ocid={`mark-complete-${Number(selected.id)}`}
                        className="flex-shrink-0"
                      >
                        {marking && markingId === selected.id
                          ? "Saving…"
                          : "Mark Complete"}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <div
                    className="prose prose-sm max-w-none text-foreground [&_p]:text-muted-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: admin-authored content
                    dangerouslySetInnerHTML={{
                      __html: selected.content ?? "<p>No content.</p>",
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
