import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const features = [
  {
    icon: BookOpen,
    title: "Rich Course Library",
    description: "Access video lessons, notes, and structured learning paths.",
  },
  {
    icon: Trophy,
    title: "Quizzes & Assignments",
    description:
      "Test your knowledge with auto-graded quizzes and assignments.",
  },
  {
    icon: Users,
    title: "Expert-led Content",
    description: "Admin-curated content designed for the Indian curriculum.",
  },
  {
    icon: Sparkles,
    title: "Track Your Progress",
    description: "Real-time analytics to monitor your learning journey.",
  },
];

const galleryPhotos = [
  {
    src: "/assets/gallery/tour-photo-1.jpg",
    alt: "Students on educational tour - Concept Grow Institute",
    caption: "Educational Tour — December 2025",
  },
  {
    src: "/assets/gallery/tour-photo-2.jpg",
    alt: "Group photo on educational tour - Concept Grow Institute",
    caption: "Educational Tour — December 2025",
  },
  {
    src: "/assets/gallery/tour-photo-3.jpg",
    alt: "Students exploring on educational tour - Concept Grow Institute",
    caption: "Educational Tour — December 2025",
  },
];

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate({ to: "/admin/dashboard" });
      else navigate({ to: "/student/dashboard" });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left panel */}
        <div className="flex flex-col justify-center px-8 py-16 lg:w-1/2 lg:px-16 xl:px-24">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-12"
          >
            <img
              src="/assets/images/logo.jpg"
              alt="Concept Grow Institute logo"
              className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-primary/40 shadow-elevated"
            />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Welcome to
              </p>
              <h1 className="text-lg font-display font-bold text-foreground leading-tight">
                Concept Grow Institute
              </h1>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight text-balance mb-4">
              Grow Your <span className="text-primary">Knowledge,</span>{" "}
              <span className="text-accent">Shape Your Future</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A comprehensive learning platform built for Indian students.
              Access courses, quizzes, notes, and more — all in one place.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 mb-12"
          >
            <Button
              size="lg"
              onClick={login}
              disabled={isLoading}
              className="gap-2 font-semibold text-base px-8"
              data-ocid="login-button"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in with Internet Identity
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </motion.div>

          {/* Features grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                className="flex gap-3 p-3 rounded-xl bg-card border border-border hover:shadow-subtle transition-smooth"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feat.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    {feat.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right panel — Hero image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
          <img
            src="/assets/generated/hero-learning.dim_1200x600.jpg"
            alt="Concept Grow Institute — learning illustration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/30" />

          {/* Floating stat cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute top-12 right-8 bg-card/90 backdrop-blur-sm border border-border rounded-xl px-5 py-3 shadow-elevated"
          >
            <p className="text-2xl font-display font-bold text-primary">500+</p>
            <p className="text-xs text-muted-foreground">Courses available</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="absolute bottom-24 right-8 bg-card/90 backdrop-blur-sm border border-border rounded-xl px-5 py-3 shadow-elevated"
          >
            <p className="text-2xl font-display font-bold text-accent">
              10,000+
            </p>
            <p className="text-xs text-muted-foreground">Active students</p>
          </motion.div>
        </div>
      </div>

      {/* Gallery section */}
      <section className="bg-muted/40 border-t border-border px-8 py-16 lg:px-16">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            <Camera className="w-3.5 h-3.5" />
            Campus Life
          </div>
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-3">
            Life at Concept Grow Institute
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Beyond the classroom — our students explore, discover, and grow
            together on enriching educational journeys.
          </p>
        </motion.div>

        {/* Staggered photo grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Photo 1 — spans full height on left, taller aspect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0 }}
            className="group relative overflow-hidden rounded-2xl shadow-elevated md:row-span-2"
            data-ocid="gallery-photo-1"
          >
            <div className="md:h-full h-64 overflow-hidden">
              <img
                src={galleryPhotos[0].src}
                alt={galleryPhotos[0].alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <p className="text-white text-sm font-semibold">
                {galleryPhotos[0].caption}
              </p>
            </div>
          </motion.div>

          {/* Photos 2 & 3 — stacked on the right */}
          {galleryPhotos.slice(1).map((photo, i) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.15 }}
              className="group relative overflow-hidden rounded-2xl shadow-elevated"
              data-ocid={`gallery-photo-${i + 2}`}
            >
              <div className="h-56 sm:h-64 overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white text-sm font-semibold">
                  {photo.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Subtle label strip */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          Concept Grow Institute Educational Tour · December 2025
        </motion.p>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border px-8 py-4">
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Concept Grow Institute. Built with love
          using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
