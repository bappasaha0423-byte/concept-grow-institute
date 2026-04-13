import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, ChevronRight, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { CoursePublic } from "../../backend.d.ts";
import {
  useEnrollInCourse,
  useListCourses,
  useMyEnrollments,
} from "../../hooks/useBackend";

export default function StudentCourses() {
  const { data: courses, isLoading } = useListCourses();
  const { data: enrolledIds } = useMyEnrollments();
  const { mutate: enroll, isPending: enrolling } = useEnrollInCourse();
  const [search, setSearch] = useState("");
  const [enrollingId, setEnrollingId] = useState<bigint | null>(null);

  const enrolledSet = new Set((enrolledIds ?? []) as bigint[]);
  const courseList = (courses ?? []) as CoursePublic[];
  const filtered = courseList.filter(
    (c) =>
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()),
  );

  function handleEnroll(id: bigint) {
    setEnrollingId(id);
    enroll(id, { onSettled: () => setEnrollingId(null) });
  }

  return (
    <div className="p-6 space-y-6" data-ocid="student-courses">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Courses
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {enrolledSet.size} enrolled · {filtered.length} available
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="courses-search"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {["c1", "c2", "c3", "c4", "c5", "c6"].map((k) => (
            <Skeleton key={k} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : !filtered.length ? (
        <Card className="border-border">
          <CardContent className="py-20 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-display font-semibold text-foreground mb-1">
              {search
                ? "No courses match your search"
                : "No courses available yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {search ? "Try different keywords." : "Check back soon."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course, i) => {
            const isEnrolled = enrolledSet.has(course.id);
            return (
              <motion.div
                key={Number(course.id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <Card
                  className="border-border overflow-hidden hover:shadow-md transition-smooth flex flex-col"
                  data-ocid={`course-card-${Number(course.id)}`}
                >
                  <div className="h-32 bg-gradient-to-br from-primary/25 via-primary/15 to-accent/20 flex items-center justify-center relative">
                    <BookOpen className="w-10 h-10 text-primary/40" />
                    {isEnrolled && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-accent text-accent-foreground text-[10px] gap-1 px-1.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Enrolled
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-1 pt-3 px-4">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-primary mb-1">
                      {course.category}
                    </span>
                    <CardTitle className="text-sm font-display line-clamp-2 leading-snug">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 flex-1 flex flex-col justify-between gap-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      {isEnrolled ? (
                        <Link
                          to="/student/courses/$courseId"
                          params={{ courseId: course.id.toString() }}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            data-ocid={`course-continue-${Number(course.id)}`}
                          >
                            Continue <ChevronRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrolling && enrollingId === course.id}
                          data-ocid={`course-enroll-${Number(course.id)}`}
                        >
                          {enrolling && enrollingId === course.id
                            ? "Enrolling…"
                            : "Enroll"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
