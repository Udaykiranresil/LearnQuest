function genId(prefix = "node") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function addChildNode(tree, parentId) {
  const newLeaf = { id: genId("t"), title: "New subtopic", xp: 30 };
  if (parentId === null) {
    return [...tree, newLeaf];
  }
  return tree.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children || []), newLeaf] };
    }
    if (node.children) {
      return { ...node, children: addChildNode(node.children, parentId) };
    }
    return node;
  });
}

export function updateNodeInTree(tree, nodeId, patch) {
  return tree.map((node) => {
    if (node.id === nodeId) return { ...node, ...patch };
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, nodeId, patch) };
    }
    return node;
  });
}

export function removeNodeFromTree(tree, nodeId) {
  return tree
    .filter((node) => node.id !== nodeId)
    .map((node) =>
      node.children
        ? { ...node, children: removeNodeFromTree(node.children, nodeId) }
        : node
    );
}

export function newCourseId(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `course-${slug || genId()}`;
}

export function newProjectId(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `proj-${slug || genId()}`;
}
