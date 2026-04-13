import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Trophy,
  User,
} from "lucide-react";

const studentNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/student/dashboard" },
  { icon: BookOpen, label: "My Courses", to: "/student/courses" },
  { icon: Trophy, label: "Quizzes", to: "/student/quizzes" },
  { icon: FileText, label: "Notes", to: "/student/notes" },
  { icon: ClipboardList, label: "Assignments", to: "/student/assignments" },
  { icon: Trophy, label: "Scores", to: "/student/scores" },
  { icon: Bell, label: "Notifications", to: "/student/notifications" },
  { icon: User, label: "Profile", to: "/student/profile" },
  { icon: CalendarDays, label: "Schedule", to: "/student/schedule" },
];

interface StudentSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function StudentSidebar({
  collapsed = false,
  onToggle,
}: StudentSidebarProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    <aside
      data-ocid="student-sidebar"
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-smooth",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-display font-bold text-sidebar-foreground truncate">
              Concept Grow
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              Student Portal
            </p>
          </div>
        )}
      </div>

      {/* Student badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-1.5 rounded-md border-l-4 border-primary bg-primary/10">
          <p className="text-xs font-semibold text-primary">Student</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {studentNavItems.map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              data-ocid={`student-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth",
                collapsed && "justify-center px-2",
                active
                  ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-center p-3 border-t border-sidebar-border hover:bg-sidebar-accent transition-smooth"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        data-ocid="student-sidebar-toggle"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}
