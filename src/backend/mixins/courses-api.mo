import UserTypes "../types/users";
import CourseTypes "../types/courses";
import Common "../types/common";
import Users "../lib/Users";
import Courses "../lib/Courses";
import List "mo:core/List";
import Time "mo:core/Time";

mixin (
  users : List.List<UserTypes.UserProfile>,
  courses : List.List<CourseTypes.Course>,
  lessons : List.List<CourseTypes.Lesson>,
  enrollments : List.List<CourseTypes.Enrollment>,
  completions : List.List<CourseTypes.LessonCompletion>,
  nextCourseId : { var v : Nat },
  nextLessonId : { var v : Nat },
) {
  // ── Courses ──────────────────────────────────────────────
  public shared query func listCourses() : async [CourseTypes.CoursePublic] {
    Courses.listCourses(courses)
  };

  public shared query func getCourse(id : Common.CourseId) : async ?CourseTypes.CoursePublic {
    Courses.getCourse(courses, id)
  };

  public shared ({ caller }) func createCourse(
    title : Text,
    description : Text,
    category : Text,
  ) : async Common.Result<CourseTypes.CoursePublic> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    let id = nextCourseId.v;
    nextCourseId.v += 1;
    let course = Courses.newCourse(id, title, description, category, caller, Time.now());
    courses.add(course);
    #ok(Courses.courseToPublic(course))
  };

  public shared ({ caller }) func updateCourse(
    id : Common.CourseId,
    title : ?Text,
    description : ?Text,
    category : ?Text,
    published : ?Bool,
  ) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Courses.updateCourse(courses, id, title, description, category, published)) #ok(true)
    else #err("Course not found")
  };

  public shared ({ caller }) func deleteCourse(id : Common.CourseId) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Courses.deleteCourse(courses, id)) #ok(true)
    else #err("Course not found")
  };

  // ── Lessons ───────────────────────────────────────────────
  public shared query func listLessons(courseId : Common.CourseId) : async [CourseTypes.LessonPublic] {
    Courses.listLessons(lessons, courseId)
  };

  public shared query func getLesson(id : Common.LessonId) : async ?CourseTypes.LessonPublic {
    Courses.getLesson(lessons, id)
  };

  public shared ({ caller }) func createLesson(
    courseId : Common.CourseId,
    title : Text,
    content : Text,
    order : Nat,
  ) : async Common.Result<CourseTypes.LessonPublic> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    let id = nextLessonId.v;
    nextLessonId.v += 1;
    let lesson = Courses.newLesson(id, courseId, title, content, order, Time.now());
    lessons.add(lesson);
    #ok(Courses.lessonToPublic(lesson))
  };

  public shared ({ caller }) func updateLesson(
    id : Common.LessonId,
    title : ?Text,
    content : ?Text,
    order : ?Nat,
  ) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Courses.updateLesson(lessons, id, title, content, order)) #ok(true)
    else #err("Lesson not found")
  };

  public shared ({ caller }) func deleteLesson(id : Common.LessonId) : async Common.Result<Bool> {
    if (not Users.isAdmin(users, caller)) return #err("Unauthorized");
    if (Courses.deleteLesson(lessons, id)) #ok(true)
    else #err("Lesson not found")
  };

  // ── Enrollments ───────────────────────────────────────────
  public shared ({ caller }) func enrollInCourse(courseId : Common.CourseId) : async Common.Result<Bool> {
    switch (users.find(func(u : UserTypes.UserProfile) : Bool { u.id == caller })) {
      case null return #err("Not registered");
      case (?_) ();
    };
    if (Courses.enroll(enrollments, caller, courseId, Time.now())) #ok(true)
    else #err("Already enrolled")
  };

  public shared query ({ caller }) func getMyEnrollments() : async [Common.CourseId] {
    Courses.enrolledCourses(enrollments, caller)
  };

  // ── Lesson Completion ─────────────────────────────────────
  public shared ({ caller }) func markLessonComplete(lessonId : Common.LessonId) : async Common.Result<Bool> {
    switch (users.find(func(u : UserTypes.UserProfile) : Bool { u.id == caller })) {
      case null return #err("Not registered");
      case (?_) ();
    };
    if (Courses.markLessonComplete(completions, caller, lessonId, Time.now())) #ok(true)
    else #err("Already marked complete")
  };

  public shared query ({ caller }) func getMyCompletedLessons() : async [Common.LessonId] {
    Courses.completedLessons(completions, caller)
  };
};
