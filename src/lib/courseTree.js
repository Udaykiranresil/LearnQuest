// Utilities for walking the recursive Course -> Topic -> Subtopic(s) tree.
// A node is "completable" (a leaf) when it has no children.

export function getLeaves(node) {
  if (!node.children || node.children.length === 0) return [node];
  return node.children.flatMap(getLeaves);
}

export function getAllLeavesForCourse(course) {
  return course.topics.flatMap(getLeaves);
}

export function getCourseTotalXp(course) {
  return getAllLeavesForCourse(course).reduce((sum, n) => sum + (n.xp || 0), 0);
}

export function getCourseProgress(course, completedIds) {
  const leaves = getAllLeavesForCourse(course);
  if (leaves.length === 0) return { done: 0, total: 0, ratio: 0 };
  const done = leaves.filter((l) => completedIds.includes(l.id)).length;
  return { done, total: leaves.length, ratio: done / leaves.length };
}

export function isCourseComplete(course, completedIds) {
  const { done, total } = getCourseProgress(course, completedIds);
  return total > 0 && done === total;
}

export function getNodeProgress(node, completedIds) {
  const leaves = getLeaves(node);
  const done = leaves.filter((l) => completedIds.includes(l.id)).length;
  return { done, total: leaves.length, ratio: leaves.length ? done / leaves.length : 0 };
}

// Depth-first flatten with parent chain, used by admin tree editor.
export function flattenWithDepth(nodes, depth = 0, parentId = null) {
  return nodes.flatMap((node) => [
    { ...node, depth, parentId },
    ...(node.children ? flattenWithDepth(node.children, depth + 1, node.id) : []),
  ]);
}
