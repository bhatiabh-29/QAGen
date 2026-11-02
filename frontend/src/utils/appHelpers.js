// --------------------------------------------------
// General app helper utilities
// Tree traversal, project lookup, and breadcrumb logic.
// --------------------------------------------------

/**
 * Find a project/folder name by id in a nested tree.
 */
export function findNodeName(nodes, id) {
    for (const n of nodes) {
        if (n.id === id) return n.name;

        if (n.children?.length) {
            const found = findNodeName(n.children, id);
            if (found) return found;
        }
    }

    return null;
}

/**
 * Find a full project/folder node by id in a nested tree.
 */
export function findNodeById(nodes, id) {
    for (const n of nodes) {
        if (n.id === id) return n;

        if (n.children?.length) {
            const found = findNodeById(n.children, id);
            if (found) return found;
        }
    }

    return null;
}

/**
 * Collect current node id plus all descendant ids.
 * Useful for project-scoped filtering.
 */
export function collectNodeAndDescendantIds(node) {
    if (!node) return [];

    let ids = [node.id];

    for (const child of node.children || []) {
        ids = ids.concat(collectNodeAndDescendantIds(child));
    }

    return ids;
}

/**
 * Build breadcrumb path for a selected project/folder.
 * Returns array of names from root -> selected node.
 */
export function buildBreadcrumb(nodes, targetId, path = []) {
    for (const node of nodes) {
        const nextPath = [...path, node.name];

        if (node.id === targetId) {
            return nextPath;
        }

        if (node.children?.length) {
            const found = buildBreadcrumb(node.children, targetId, nextPath);
            if (found.length) return found;
        }
    }

    return [];
}