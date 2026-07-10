import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { Plus, Save, Trash2, X } from "lucide-react";
import Layout from "../../components/Layout";
import Button from "../../components/Button";
import AdminTreeNode from "../../components/AdminTreeNode";
import { useApp } from "../../context/AppContext";
import { addChildNode, updateNodeInTree, removeNodeFromTree, newCourseId } from "../../lib/treeOps";
import { getCourseTotalXp } from "../../lib/courseTree";

const ICON_OPTIONS = ["BookOpen", "Network", "Database", "BrainCircuit", "Cpu", "Code2", "Globe", "ShieldCheck", "Terminal", "Layers"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

function NewCourseModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("BookOpen");
  const [difficulty, setDifficulty] = useState("Beginner");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)] w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg text-[var(--color-parchment)]">New Course</h3>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-parchment)]">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[var(--color-muted)] block mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-3 py-2.5 text-sm text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)]"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-muted)] block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-3 py-2.5 text-sm text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--color-muted)] block mb-1.5">Icon</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-3 py-2.5 text-sm text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)]"
              >
                {ICON_OPTIONS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)] block mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-[var(--color-ink)] border border-[var(--color-panel-line)] px-3 py-2.5 text-sm text-[var(--color-parchment)] outline-none focus:border-[var(--color-brass)]"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-2.5 mt-6">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1"
            disabled={!title.trim()}
            onClick={() =>
              onCreate({
                id: newCourseId(title),
                title: title.trim(),
                description: description.trim(),
                icon,
                difficulty,
                topics: [],
                projectId: null,
              })
            }
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCourseManager() {
  const { courses, addCourse, updateCourse, deleteCourse, setCourseTopics } = useApp();
  const [selectedId, setSelectedId] = useState(courses[0]?.id || null);
  const [showModal, setShowModal] = useState(false);
  const [localTopics, setLocalTopics] = useState([]);
  const [dirty, setDirty] = useState(false);

  const selected = courses.find((c) => c.id === selectedId);

  useEffect(() => {
    if (selected) {
      setLocalTopics(selected.topics);
      setDirty(false);
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  function mutate(fn) {
    setLocalTopics((prev) => fn(prev));
    setDirty(true);
  }

  function handleSave() {
    setCourseTopics(selectedId, localTopics);
    setDirty(false);
  }

  function handleCreate(course) {
    addCourse(course);
    setSelectedId(course.id);
    setShowModal(false);
  }

  function handleDeleteCourse(id) {
    if (!confirm("Delete this course and all its chapters? This cannot be undone.")) return;
    deleteCourse(id);
    if (selectedId === id) setSelectedId(courses.find((c) => c.id !== id)?.id || null);
  }

  return (
    <Layout
      eyebrow="Administration"
      title="Curriculum"
      actions={
        <Button icon={Plus} onClick={() => setShowModal(true)}>
          New Course
        </Button>
      }
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 bg-[var(--color-panel)] border border-[var(--color-panel-line)]">
          {courses.map((c) => {
            const CIcon = Icons[c.icon] || Icons.BookOpen;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-[var(--color-panel-line)] last:border-b-0 transition-colors ${
                  selectedId === c.id ? "bg-[var(--color-panel-raised)]" : "hover:bg-[var(--color-panel-raised)]/50"
                }`}
              >
                <CIcon size={16} strokeWidth={1.6} className="text-[var(--color-brass)] shrink-0" />
                <span className="text-sm text-[var(--color-parchment)] truncate flex-1">{c.title}</span>
                <span className="font-mono text-[10px] text-[var(--color-muted)]">{c.topics.length}</span>
              </button>
            );
          })}
        </div>

        <div className="col-span-8">
          {selected ? (
            <div className="bg-[var(--color-panel)] border border-[var(--color-panel-line)]">
              <div className="px-5 py-4 border-b border-[var(--color-panel-line)] flex items-center justify-between">
                <div>
                  <div className="font-display text-base text-[var(--color-parchment)]">
                    {selected.title}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--color-muted)] mt-0.5">
                    {getCourseTotalXp({ ...selected, topics: localTopics })} XP total
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDeleteCourse(selected.id)}>
                    Delete
                  </Button>
                  <Button size="sm" icon={Save} disabled={!dirty} onClick={handleSave}>
                    Save
                  </Button>
                </div>
              </div>

              <div className="p-5">
                {localTopics.length === 0 && (
                  <p className="text-sm text-[var(--color-muted)] mb-4">
                    No chapters yet. Add the first one below.
                  </p>
                )}
                {localTopics.map((node) => (
                  <AdminTreeNode
                    key={node.id}
                    node={node}
                    depth={0}
                    onAddChild={(parentId) => mutate((t) => addChildNode(t, parentId))}
                    onUpdate={(id, patch) => mutate((t) => updateNodeInTree(t, id, patch))}
                    onRemove={(id) => mutate((t) => removeNodeFromTree(t, id))}
                  />
                ))}
                <button
                  onClick={() => mutate((t) => addChildNode(t, null))}
                  className="flex items-center gap-2 text-xs text-[var(--color-brass)] hover:text-[var(--color-brass-bright)] mt-3"
                >
                  <Plus size={14} /> Add top-level chapter
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-[var(--color-muted)]">Select or create a course to begin.</div>
          )}
        </div>
      </div>

      {showModal && (
        <NewCourseModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </Layout>
  );
}
