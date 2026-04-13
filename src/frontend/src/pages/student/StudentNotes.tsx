import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Search, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { NotePublic } from "../../backend.d.ts";
import { useListCourses, useListNotes } from "../../hooks/useBackend";

export default function StudentNotes() {
  const { data: notes, isLoading } = useListNotes();
  const { data: courses } = useListCourses();
  const [search, setSearch] = useState("");
  const [filterCourseId, setFilterCourseId] = useState<bigint | null>(null);
  const [selected, setSelected] = useState<NotePublic | null>(null);

  const courseMap = new Map(
    (courses ?? []).map((c) => [c.id.toString(), c.title]),
  );
  const noteList = notes ?? [];

  const filtered = noteList.filter((n) => {
    const matchSearch =
      !search || n.title.toLowerCase().includes(search.toLowerCase());
    const matchCourse = !filterCourseId || n.courseId === filterCourseId;
    return matchSearch && matchCourse;
  });

  const uniqueCourseIds = [
    ...new Set(
      noteList
        .map((n) => n.courseId)
        .filter((id): id is bigint => id !== undefined),
    ),
  ];

  return (
    <div className="p-6 space-y-5" data-ocid="student-notes">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Study Notes
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} notes available
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="notes-search"
          />
        </div>
      </div>

      {uniqueCourseIds.length > 0 && (
        <div className="flex flex-wrap gap-2" data-ocid="notes-course-filter">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="space-y-3">
              {["n1", "n2", "n3", "n4"].map((k) => (
                <Skeleton key={k} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : !filtered.length ? (
            <Card className="border-border">
              <CardContent className="py-14 text-center">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {search || filterCourseId
                    ? "No notes match your filters."
                    : "No study notes published yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((note, i) => (
                <motion.button
                  key={Number(note.id)}
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  onClick={() =>
                    setSelected(note.id === selected?.id ? null : note)
                  }
                  data-ocid={`note-item-${Number(note.id)}`}
                  className={`w-full text-left p-3 rounded-lg border transition-smooth ${selected?.id === note.id ? "border-primary bg-primary/8" : "border-border hover:bg-muted/30"}`}
                >
                  <div className="flex items-start gap-2.5">
                    <FileText
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${selected?.id === note.id ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${selected?.id === note.id ? "text-primary" : "text-foreground"}`}
                      >
                        {note.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {note.courseId && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4"
                          >
                            {courseMap.get(note.courseId.toString()) ??
                              "Course"}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(
                            Number(note.createdAt) / 1_000_000,
                          ).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {!selected ? (
            <Card className="border-border h-full">
              <CardContent className="flex flex-col items-center justify-center min-h-[300px] h-full py-16">
                <FileText className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="font-display font-semibold text-foreground mb-1">
                  Select a note
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  Click any note to read its content.
                </p>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              key={Number(selected.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border border-border rounded-xl overflow-hidden bg-card"
            >
              <div className="flex items-start justify-between gap-3 p-4 border-b border-border bg-muted/20">
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-foreground text-base">
                    {selected.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {selected.courseId && (
                      <Badge variant="outline" className="text-xs">
                        {courseMap.get(selected.courseId.toString()) ??
                          "Course"}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(
                        Number(selected.createdAt) / 1_000_000,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-smooth flex-shrink-0"
                  aria-label="Close note"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              <ScrollArea className="h-[500px]">
                <div
                  className="p-5 prose prose-sm max-w-none text-foreground [&_p]:text-muted-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_li]:text-muted-foreground"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: admin-authored content
                  dangerouslySetInnerHTML={{
                    __html: selected.content ?? "<p>No content available.</p>",
                  }}
                />
              </ScrollArea>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
