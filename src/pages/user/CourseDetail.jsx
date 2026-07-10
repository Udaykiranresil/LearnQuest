import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import * as Icons from "lucide-react";
import { Lock, FolderGit2, ArrowRight, ArrowLeft } from "lucide-react";
import Layout from "../../components/Layout";
import MasteryRing from "../../components/MasteryRing";
import TopicNode from "../../components/TopicNode";
import Toast from "../../components/Toast";
import { useApp } from "../../context/AppContext";
import { getCourseProgress } from "../../lib/courseTree";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser, courses, projects, completeSubtopic, uncompleteSubtopic } = useApp();
  const [toasts, setToasts] = useState([]);

  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    return (
      <Layout title="Not Found">
        <p className="text-[var(--color-muted)]">This course does not exist.</p>
      </Layout>
    );
  }

  const progress = getCourseProgress(course, currentUser.completedIds);
  const project = projects.find((p) => p.id === course.projectId);
  const CIcon = Icons[course.icon] || Icons.BookOpen;

  function pushToast(toast) {
    const key = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, key }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.key !== key));
    }, 3200);
  }

  async function handleToggleLeaf(node) {
    const isDone = currentUser.completedIds.includes(node.id);
    if (isDone) {
      uncompleteSubtopic(currentUser.id, node.id, node.xp);
      return;
    }
    pushToast({ message: `+${node.xp} XP earned` });
    const newBadgeIds = await completeSubtopic(currentUser.id, node.id, node.xp);
    newBadgeIds.forEach((badgeId) => {
      setTimeout(() => pushToast({ badgeId }), 400);
    });
  }

  return (
    <Layout
      eyebrow={course.difficulty}
      title={course.title}
      actions={
        <button
          onClick={() => navigate("/app/courses")}
          className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-parchment)]"
        >
          <ArrowLeft size={14} /> All courses
        </button>
      }
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)]">
            <div className="px-5 py-4 border-b border-[var(--color-panel-line)] flex items-center justify-between">
              <span className="eyebrow">Chapters</span>
              <span className="font-mono text-xs text-[var(--color-muted)]">
                {progress.done}/{progress.total} complete
              </span>
            </div>
            {course.topics.map((topic, i) => (
              <TopicNode
                key={topic.id}
                node={topic}
                index={i}
                depth={0}
                completedIds={currentUser.completedIds}
                onToggleLeaf={handleToggleLeaf}
              />
            ))}
          </div>
        </div>

        <div className="col-span-4 space-y-6">
          <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)] p-6 flex flex-col items-center">
            <div className="w-11 h-11 flex items-center justify-center border border-[var(--color-panel-line)] mb-4">
              <CIcon size={20} strokeWidth={1.5} className="text-[var(--color-brass)]" />
            </div>
            <MasteryRing ratio={progress.ratio} size={110} label={`${Math.round(progress.ratio * 100)}%`} sublabel="Mastered" />
            <p className="text-xs text-[var(--color-muted)] text-center mt-4 leading-relaxed">
              {course.description}
            </p>
          </div>

          {project && (
            <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)] p-6">
              <div className="eyebrow mb-3 flex items-center gap-2">
                <FolderGit2 size={13} strokeWidth={1.8} />
                Capstone Project
              </div>
              <h3 className="font-display text-base text-[var(--color-parchment)] mb-2">
                {project.title}
              </h3>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-4">
                {project.description}
              </p>
              {progress.ratio < 1 ? (
                <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] border border-[var(--color-panel-line)] px-3 py-2.5">
                  <Lock size={13} strokeWidth={1.8} />
                  Complete all chapters to unlock
                </div>
              ) : (
                <Link
                  to={`/app/projects/${project.id}`}
                  className="flex items-center justify-center gap-2 bg-[var(--color-brass)] text-[var(--color-void)] py-2.5 text-sm font-medium hover:bg-[var(--color-brass-bright)] transition-colors"
                >
                  Open Project <ArrowRight size={15} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <Toast toasts={toasts} />
    </Layout>
  );
}
