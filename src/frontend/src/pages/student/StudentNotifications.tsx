import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, CheckCheck } from "lucide-react";
import { motion } from "motion/react";
import type { AnnouncementPublic } from "../../backend.d.ts";
import {
  useListAnnouncements,
  useMarkAnnouncementRead,
} from "../../hooks/useBackend";

export default function StudentNotifications() {
  const { data: announcements, isLoading } = useListAnnouncements();
  const { mutate: markRead, isPending: marking } = useMarkAnnouncementRead();

  const annList = (announcements ?? []) as AnnouncementPublic[];
  const unreadCount = annList.filter((a) => !a.isRead).length;

  return (
    <div className="p-6 space-y-6" data-ocid="student-notifications">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Notifications
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {annList.length} announcement{annList.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Badge
            className="bg-primary text-primary-foreground gap-1.5"
            data-ocid="notifications-unread-badge"
          >
            <Bell className="w-3 h-3" />
            {unreadCount} unread
          </Badge>
        )}
      </div>

      <Card className="border-border">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-display">
            All Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-px">
              {["n1", "n2", "n3", "n4"].map((k) => (
                <div
                  key={k}
                  className="p-4 border-b border-border last:border-0"
                >
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : !annList.length ? (
            <div className="text-center py-16">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-display font-semibold text-foreground mb-1">
                No announcements yet
              </p>
              <p className="text-sm text-muted-foreground">
                Your teachers haven't posted any announcements.
              </p>
            </div>
          ) : (
            <div>
              {annList.map((ann, i) => (
                <motion.div
                  key={Number(ann.id)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`flex items-start gap-4 p-4 border-b border-border last:border-0 transition-smooth ${ann.isRead ? "bg-muted/10 opacity-80" : "bg-card hover:bg-muted/20"}`}
                  data-ocid={`notification-${Number(ann.id)}`}
                >
                  <div className="flex-shrink-0 mt-1.5">
                    <span
                      className={`block w-2.5 h-2.5 rounded-full ${ann.isRead ? "bg-border" : "bg-primary shadow-sm"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={`text-sm font-semibold ${ann.isRead ? "text-muted-foreground" : "text-foreground"}`}
                      >
                        {ann.title}
                      </p>
                      <span className="text-[11px] text-muted-foreground flex-shrink-0">
                        {new Date(
                          Number(ann.createdAt) / 1_000_000,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-1 leading-relaxed ${ann.isRead ? "text-muted-foreground/70" : "text-muted-foreground"}`}
                    >
                      {ann.message}
                    </p>
                    {!ann.isRead ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-7 px-2 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => markRead(ann.id)}
                        disabled={marking}
                        data-ocid={`mark-read-${Number(ann.id)}`}
                      >
                        <Check className="w-3 h-3" /> Mark as read
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1 mt-1.5">
                        <CheckCheck className="w-3 h-3 text-muted-foreground/50" />
                        <span className="text-[11px] text-muted-foreground/50">
                          Read
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
