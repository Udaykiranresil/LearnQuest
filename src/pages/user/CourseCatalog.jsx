import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Layout from "../../components/Layout";
import MasteryRing from "../../components/MasteryRing";
import { useApp } from "../../context/AppContext";
import { getCourseProgress } from "../../lib/courseTree";

const DIFFICULTY_COLOR = {
  Beginner: "var(--color-verdant-bright)",
  Intermediate: "var(--color-indigo-bright)",
  Advanced: "var(--color-oxblood-bright)",
};

export default function CourseCatalog() {
  const { currentUser, courses } = useApp();

  return (
    <Layout eyebrow="The Curriculum" title="Courses">
      <div className="grid grid-cols-3 gap-5">
        {courses.map((course) => {
          const progress = getCourseProgress(course, currentUser.completedIds);
          const CIcon = Icons[course.icon] || Icons.BookOpen;
          const complete = progress.total > 0 && progress.done === progress.total;
          return (
            <Link
              key={course.id}
              to={`/app/courses/${course.id}`}
              className="group bg-[var(--color-panel)] border border-[var(--color-panel-line)] hover:border-[var(--color-brass)] transition-colors p-6 flex flex-col"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 flex items-center justify-center border border-[var(--color-panel-line)] group-hover:border-[var(--color-brass)] transition-colors">
                  <CIcon size={20} strokeWidth={1.5} className="text-[var(--color-brass)]" />
                </div>
                <MasteryRing ratio={progress.ratio} size={48} strokeWidth={3} />
              </div>

              <div
                className="eyebrow mb-1.5"
                style={{ color: DIFFICULTY_COLOR[course.difficulty] }}
              >
                {course.difficulty}
              </div>
              <h3 className="font-display text-lg text-[var(--color-parchment)] mb-2 leading-snug">
                {course.title}
              </h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-5 flex-1">
                {course.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-panel-line)]">
                <span className="font-mono text-xs text-[var(--color-muted)]">
                  {progress.done}/{progress.total} chapters
                </span>
                {complete ? (
                  <span className="flex items-center gap-1.5 text-xs text-[var(--color-verdant-bright)]">
                    <CheckCircle2 size={14} strokeWidth={1.8} />
                    Complete
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-[var(--color-brass)] group-hover:text-[var(--color-brass-bright)]">
                    Open <ArrowRight size={13} />
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </Layout>
  );
}
