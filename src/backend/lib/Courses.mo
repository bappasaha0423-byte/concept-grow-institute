import Types "../types/courses";
import Common "../types/common";
import List "mo:core/List";

module {
  // ── Courses ──────────────────────────────────────────────
  public func newCourse(
    id : Common.CourseId,
    title : Text,
    description : Text,
    category : Text,
    createdBy : Common.UserId,
    createdAt : Common.Timestamp,
  ) : Types.Course {
    { id; var title; var description; var category; var published = false; createdBy; var createdAt }
  };

  public func courseToPublic(c : Types.Course) : Types.CoursePublic {
    { id = c.id; title = c.title; description = c.description; category = c.category; published = c.published; createdBy = c.createdBy; createdAt = c.createdAt }
  };

  public func listCourses(courses : List.List<Types.Course>) : [Types.CoursePublic] {
    courses.map<Types.Course, Types.CoursePublic>(func(c) { courseToPublic(c) }).toArray()
  };

  public func getCourse(courses : List.List<Types.Course>, id : Common.CourseId) : ?Types.CoursePublic {
    switch (courses.find(func(c : Types.Course) : Bool { c.id == id })) {
      case (?c) ?courseToPublic(c);
      case null null;
    }
  };

  public func updateCourse(
    courses : List.List<Types.Course>,
    id : Common.CourseId,
    title : ?Text,
    description : ?Text,
    category : ?Text,
    published : ?Bool,
  ) : Bool {
    switch (courses.find(func(c : Types.Course) : Bool { c.id == id })) {
      case null false;
      case (?c) {
        switch (title) { case (?t) c.title := t; case null () };
        switch (description) { case (?d) c.description := d; case null () };
        switch (category) { case (?cat) c.category := cat; case null () };
        switch (published) { case (?p) c.published := p; case null () };
        true
      };
    }
  };

  public func deleteCourse(courses : List.List<Types.Course>, id : Common.CourseId) : Bool {
    let before = courses.size();
    let filtered = courses.filter(func(c : Types.Course) : Bool { c.id != id });
    if (filtered.size() < before) {
      courses.clear();
      courses.append(filtered);
      true
    } else {
      false
    }
  };

  // ── Lessons ───────────────────────────────────────────────
  public func newLesson(
    id : Common.LessonId,
    courseId : Common.CourseId,
    title : Text,
    content : Text,
    order : Nat,
    createdAt : Common.Timestamp,
  ) : Types.Lesson {
    { id; courseId; var title; var content; var order; var createdAt }
  };

  public func lessonToPublic(l : Types.Lesson) : Types.LessonPublic {
    { id = l.id; courseId = l.courseId; title = l.title; content = l.content; order = l.order; createdAt = l.createdAt }
  };

  public func listLessons(lessons : List.List<Types.Lesson>, courseId : Common.CourseId) : [Types.LessonPublic] {
    lessons.filter(func(l : Types.Lesson) : Bool { l.courseId == courseId })
           .map<Types.Lesson, Types.LessonPublic>(func(l) { lessonToPublic(l) })
           .toArray()
  };

  public func getLesson(lessons : List.List<Types.Lesson>, id : Common.LessonId) : ?Types.LessonPublic {
    switch (lessons.find(func(l : Types.Lesson) : Bool { l.id == id })) {
      case (?l) ?lessonToPublic(l);
      case null null;
    }
  };

  public func updateLesson(
    lessons : List.List<Types.Lesson>,
    id : Common.LessonId,
    title : ?Text,
    content : ?Text,
    order : ?Nat,
  ) : Bool {
    switch (lessons.find(func(l : Types.Lesson) : Bool { l.id == id })) {
      case null false;
      case (?l) {
        switch (title) { case (?t) l.title := t; case null () };
        switch (content) { case (?c) l.content := c; case null () };
        switch (order) { case (?o) l.order := o; case null () };
        true
      };
    }
  };

  public func deleteLesson(lessons : List.List<Types.Lesson>, id : Common.LessonId) : Bool {
    let before = lessons.size();
    let filtered = lessons.filter(func(l : Types.Lesson) : Bool { l.id != id });
    if (filtered.size() < before) {
      lessons.clear();
      lessons.append(filtered);
      true
    } else {
      false
    }
  };

  // ── Enrollments ───────────────────────────────────────────
  public func enroll(
    enrollments : List.List<Types.Enrollment>,
    studentId : Common.UserId,
    courseId : Common.CourseId,
    enrolledAt : Common.Timestamp,
  ) : Bool {
    let alreadyEnrolled = enrollments.find(func(e : Types.Enrollment) : Bool {
      e.studentId == studentId and e.courseId == courseId
    });
    switch (alreadyEnrolled) {
      case (?_) false;
      case null {
        enrollments.add({ studentId; courseId; enrolledAt });
        true
      };
    }
  };

  public func isEnrolled(
    enrollments : List.List<Types.Enrollment>,
    studentId : Common.UserId,
    courseId : Common.CourseId,
  ) : Bool {
    switch (enrollments.find(func(e : Types.Enrollment) : Bool {
      e.studentId == studentId and e.courseId == courseId
    })) {
      case (?_) true;
      case null false;
    }
  };

  public func enrolledCourses(
    enrollments : List.List<Types.Enrollment>,
    studentId : Common.UserId,
  ) : [Common.CourseId] {
    enrollments.filter(func(e : Types.Enrollment) : Bool { e.studentId == studentId })
               .map<Types.Enrollment, Common.CourseId>(func(e) { e.courseId })
               .toArray()
  };

  public func enrollmentCount(
    enrollments : List.List<Types.Enrollment>,
    courseId : Common.CourseId,
  ) : Nat {
    enrollments.filter(func(e : Types.Enrollment) : Bool { e.courseId == courseId }).size()
  };

  // ── Lesson Completion ─────────────────────────────────────
  public func markLessonComplete(
    completions : List.List<Types.LessonCompletion>,
    studentId : Common.UserId,
    lessonId : Common.LessonId,
    completedAt : Common.Timestamp,
  ) : Bool {
    let alreadyDone = completions.find(func(c : Types.LessonCompletion) : Bool {
      c.studentId == studentId and c.lessonId == lessonId
    });
    switch (alreadyDone) {
      case (?_) false;
      case null {
        completions.add({ studentId; lessonId; completedAt });
        true
      };
    }
  };

  public func completedLessons(
    completions : List.List<Types.LessonCompletion>,
    studentId : Common.UserId,
  ) : [Common.LessonId] {
    completions.filter(func(c : Types.LessonCompletion) : Bool { c.studentId == studentId })
               .map<Types.LessonCompletion, Common.LessonId>(func(c) { c.lessonId })
               .toArray()
  };

  public func completionCount(
    completions : List.List<Types.LessonCompletion>,
    studentId : Common.UserId,
  ) : Nat {
    completions.filter(func(c : Types.LessonCompletion) : Bool { c.studentId == studentId }).size()
  };
};
