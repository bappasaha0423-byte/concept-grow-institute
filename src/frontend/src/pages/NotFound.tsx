import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6"
      data-ocid="not-found-page"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Copy */}
        <h1 className="text-7xl font-display font-bold text-primary mb-2">
          404
        </h1>
        <h2 className="text-2xl font-display font-semibold text-foreground mb-3">
          Page not found
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Looks like this lesson doesn't exist yet. The page you're looking for
          has either moved or never existed.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            variant="default"
            className="gap-2"
            data-ocid="not-found-go-home"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="gap-2"
            data-ocid="not-found-browse-courses"
          >
            <Link to="/student/courses">
              <BookOpen className="w-4 h-4" />
              Browse Courses
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>
    </div>
  );
}
