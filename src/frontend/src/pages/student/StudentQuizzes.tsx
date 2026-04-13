import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { createActor } from "../../backend";
import type { CoursePublic, QuizAttempt, QuizPublic } from "../../backend.d.ts";
import {
  useListAllQuizzes,
  useListCourses,
  useMyAttempts,
  useMyEnrollments,
} from "../../hooks/useBackend";

type QuestionPublic = { id: bigint; text: string; options: string[] };
type QuizView = "list" | "taking" | "result";

export default function StudentQuizzes() {
  const { data: allQuizzes, isLoading } = useListAllQuizzes();
  const { data: enrolledIds } = useMyEnrollments();
  const { data: courses } = useListCourses();
  const { data: attempts, refetch: refetchAttempts } = useMyAttempts();
  const { actor } = useActor(createActor);

  const [view, setView] = useState<QuizView>("list");
  const [activeQuiz, setActiveQuiz] = useState<QuizPublic | null>(null);
  const [questions, setQuestions] = useState<QuestionPublic[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultScore, setResultScore] = useState(0);
  const [resultTotal, setResultTotal] = useState(1);
  const [resultBreakdown, setResultBreakdown] = useState<
    Array<{ question: string; chosen: number; ok: boolean }>
  >([]);

  const enrolledSet = new Set((enrolledIds ?? []) as bigint[]);
  const quizList = ((allQuizzes ?? []) as QuizPublic[]).filter((q) =>
    enrolledSet.has(q.courseId),
  );

  const courseMap = new Map(
    ((courses ?? []) as CoursePublic[]).map((c) => [c.id.toString(), c.title]),
  );

  const attemptsByQuiz = new Map<string, QuizAttempt[]>();
  for (const att of (attempts ?? []) as QuizAttempt[]) {
    const key = att.quizId.toString();
    const existing = attemptsByQuiz.get(key) ?? [];
    attemptsByQuiz.set(key, [...existing, att]);
  }

  async function startQuiz(quiz: QuizPublic) {
    if (!actor) return;
    setLoadingQuiz(true);
    try {
      const qs = await actor.listQuestions(quiz.id);
      const sorted = [...(qs as QuestionPublic[])].sort(() => 0);
      setQuestions(sorted);
      setAnswers(new Array(sorted.length).fill(-1));
      setCurrentQ(0);
      setActiveQuiz(quiz);
      setView("taking");
    } finally {
      setLoadingQuiz(false);
    }
  }

  async function submitQuiz() {
    if (!actor || !activeQuiz) return;
    setSubmitting(true);
    try {
      const result = await actor.submitQuizAttempt(
        activeQuiz.id,
        answers.map(BigInt),
      );
      if (result.__kind__ === "ok") {
        const att = result.ok;
        const pct =
          att.total > 0n
            ? Math.round((Number(att.score) / Number(att.total)) * 100)
            : 0;
        setResultScore(pct);
        setResultTotal(Number(att.total));
        setResultBreakdown(
          questions.map((q, i) => ({
            question: q.text,
            chosen: answers[i] ?? -1,
            ok: Number(att.answers[i] ?? 0n) === 1,
          })),
        );
      }
      setView("result");
      refetchAttempts();
    } finally {
      setSubmitting(false);
    }
  }

  function resetToList() {
    setView("list");
    setActiveQuiz(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentQ(0);
  }

  // ── Quiz taking view ──
  if (view === "taking" && activeQuiz) {
    const q = questions[currentQ];
    const pct = ((currentQ + 1) / questions.length) * 100;
    const answered = answers.filter((a) => a !== -1).length;

    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6" data-ocid="quiz-taking">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetToList}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-smooth"
            aria-label="Exit quiz"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-display font-bold text-foreground truncate">
              {activeQuiz.title}
            </h2>
            <p className="text-xs text-muted-foreground">
              {answered}/{questions.length} answered
            </p>
          </div>
        </div>
        <Progress value={pct} className="h-2" />
        {q && (
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 mt-0.5">
                    {currentQ + 1}
                  </span>
                  <CardTitle className="text-base font-medium text-foreground leading-snug">
                    {q.text}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {q.options.map((opt, oi) => (
                  <button
                    key={`opt-${oi}-${opt.slice(0, 20)}`}
                    type="button"
                    onClick={() => {
                      const updated = [...answers];
                      updated[currentQ] = oi;
                      setAnswers(updated);
                    }}
                    data-ocid={`option-${currentQ}-${oi}`}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-smooth ${answers[currentQ] === oi ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:bg-muted/40 text-foreground"}`}
                  >
                    <span className="font-mono text-muted-foreground mr-2 text-xs">
                      {String.fromCharCode(65 + oi)}.
                    </span>
                    {opt}
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
            disabled={currentQ === 0}
            className="gap-1.5"
            data-ocid="quiz-prev"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>
          {currentQ < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQ((p) => p + 1)}
              className="gap-1.5"
              data-ocid="quiz-next"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={submitQuiz}
              disabled={submitting || answered < questions.length}
              className="gap-1.5 bg-accent hover:bg-accent/90"
              data-ocid="quiz-submit"
            >
              {submitting ? "Submitting…" : "Submit Quiz"}
            </Button>
          )}
        </div>
        {answered < questions.length && currentQ === questions.length - 1 && (
          <p className="text-xs text-center text-muted-foreground">
            Answer all {questions.length} questions to submit.
          </p>
        )}
      </div>
    );
  }

  // ── Result view ──
  if (view === "result" && activeQuiz) {
    const passed = resultScore >= 60;
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6" data-ocid="quiz-result">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card
            className={`border-2 ${passed ? "border-accent/40 bg-accent/5" : "border-destructive/40 bg-destructive/5"}`}
          >
            <CardContent className="pt-8 pb-6 text-center">
              <div
                className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? "bg-accent/15" : "bg-destructive/15"}`}
              >
                {passed ? (
                  <Trophy className="w-8 h-8 text-accent" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-destructive" />
                )}
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                {passed ? "Passed! 🎉" : "Not Passed"}
              </h2>
              <p className="text-4xl font-display font-bold mt-2 mb-1">
                {resultScore}%
              </p>
              <p className="text-sm text-muted-foreground">
                Score: {Math.round((resultScore * resultTotal) / 100)} /{" "}
                {resultTotal}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-display">
              Answer Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resultBreakdown.map((item, i) => (
              <div
                key={`rbk-${i}-${item.question.slice(0, 10)}`}
                className={`p-3 rounded-lg border ${item.ok ? "border-accent/30 bg-accent/5" : "border-destructive/30 bg-destructive/5"}`}
                data-ocid={`result-q-${i}`}
              >
                <div className="flex items-start gap-2">
                  {item.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm text-foreground">{item.question}</p>
                </div>
                <p
                  className={`text-xs mt-1.5 ml-6 ${item.ok ? "text-accent" : "text-destructive"}`}
                >
                  {item.ok
                    ? "Correct"
                    : `Your answer: Option ${String.fromCharCode(65 + item.chosen)}`}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={resetToList}
            className="flex-1"
            data-ocid="result-back"
          >
            Back to Quizzes
          </Button>
          <Button
            onClick={() => startQuiz(activeQuiz)}
            className="flex-1 bg-primary"
            data-ocid="result-retry"
          >
            Retry Quiz
          </Button>
        </div>
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="p-6 space-y-6" data-ocid="student-quizzes">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Quizzes
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {quizList.length} quiz(zes) available
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {["q1", "q2", "q3"].map((k) => (
            <Skeleton key={k} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !quizList.length ? (
        <Card className="border-border">
          <CardContent className="py-20 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-display font-semibold text-foreground mb-1">
              No quizzes yet
            </p>
            <p className="text-sm text-muted-foreground">
              Enroll in courses to access their quizzes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quizList.map((quiz, i) => {
            const quizAtts = attemptsByQuiz.get(quiz.id.toString()) ?? [];
            const best = quizAtts.reduce<QuizAttempt | null>(
              (b, a) => (!b || Number(a.score) > Number(b.score) ? a : b),
              null,
            );
            const bestPct =
              best && best.total > 0n
                ? Math.round((Number(best.score) / Number(best.total)) * 100)
                : null;
            return (
              <motion.div
                key={Number(quiz.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
              >
                <Card
                  className="border-border hover:shadow-sm transition-smooth"
                  data-ocid={`quiz-card-${Number(quiz.id)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-sm font-display font-semibold text-foreground">
                            {quiz.title}
                          </h3>
                          {bestPct !== null && bestPct >= 60 && (
                            <Badge className="bg-accent/15 text-accent border-0 text-[10px] gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Passed
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {quiz.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="text-primary">
                            {courseMap.get(quiz.courseId.toString()) ??
                              "Course"}
                          </span>
                          {quizAtts.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {quizAtts.length} attempt
                              {quizAtts.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {bestPct !== null && (
                          <span
                            className={`text-sm font-bold ${bestPct >= 60 ? "text-accent" : "text-muted-foreground"}`}
                          >
                            Best: {bestPct}%
                          </span>
                        )}
                        <Button
                          size="sm"
                          onClick={() => startQuiz(quiz)}
                          disabled={loadingQuiz}
                          variant={quizAtts.length > 0 ? "outline" : "default"}
                          data-ocid={`quiz-start-${Number(quiz.id)}`}
                        >
                          {loadingQuiz
                            ? "Loading…"
                            : quizAtts.length > 0
                              ? "Retry"
                              : "Start Quiz"}
                        </Button>
                      </div>
                    </div>
                    {quizAtts.length > 0 && (
                      <>
                        <Separator className="my-3" />
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Past Attempts
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {quizAtts.slice(0, 4).map((att) => {
                              const pct =
                                att.total > 0n
                                  ? Math.round(
                                      (Number(att.score) / Number(att.total)) *
                                        100,
                                    )
                                  : 0;
                              return (
                                <div
                                  key={Number(att.id)}
                                  className="flex items-center justify-between bg-muted/30 rounded px-2.5 py-1.5 text-xs"
                                  data-ocid={`attempt-row-${Number(att.id)}`}
                                >
                                  <span className="text-muted-foreground">
                                    {new Date(
                                      Number(att.submittedAt) / 1_000_000,
                                    ).toLocaleDateString("en-IN")}
                                  </span>
                                  <span
                                    className={`font-semibold ${pct >= 60 ? "text-accent" : "text-destructive"}`}
                                  >
                                    {pct}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
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
