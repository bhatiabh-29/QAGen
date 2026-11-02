import React, { useState } from "react";

// --------------------------------------------------
// TreeNode
// Recursive project/folder row used by the sidebar.
// Supports:
// - select
// - rename
// - delete
// - add subfolder
// - expand/collapse
// --------------------------------------------------

export default function TreeNode({
                                     node,
                                     depth = 0,
                                     activeId,
                                     onSelect,
                                     onRename,
                                     onDelete,
                                     onAddChild,
                                 }) {
    const [editing, setEditing] = useState(false);
    const [addingChild, setAddingChild] = useState(false);
    const [collapsed, setCollapsed] = useState(depth > 0);
    const [name, setName] = useState(node.name);
    const [childName, setChildName] = useState("");

    const isActive = activeId === node.id;
    const hasChildren = (node.children || []).length > 0;

    return (
        <div>
            {/* Main row */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingLeft: 8 + depth * 14,
                    paddingRight: 8,
                    background: isActive ? "rgba(59,130,246,0.15)" : "none",
                    borderRadius: 6,
                    marginBottom: 2,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    {/* Expand / collapse button */}
                    <button
                        onClick={() => hasChildren && setCollapsed((v) => !v)}
                        style={{
                            width: 18,
                            height: 18,
                            border: "none",
                            background: "none",
                            color: hasChildren ? "#93c5fd" : "transparent",
                            cursor: hasChildren ? "pointer" : "default",
                            fontSize: 11,
                            padding: 0,
                        }}
                        title={hasChildren ? (collapsed ? "Expand" : "Collapse") : ""}
                    >
                        {hasChildren ? (collapsed ? "▶" : "▼") : "•"}
                    </button>

                    {/* Rename input */}
                    {editing ? (
                        <input
                            value={name}
                            autoFocus
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => {
                                onRename(node.id, name);
                                setEditing(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    onRename(node.id, name);
                                    setEditing(false);
                                }
                                if (e.key === "Escape") {
                                    setName(node.name);
                                    setEditing(false);
                                }
                            }}
                            style={{
                                flex: 1,
                                background: "#1f2937",
                                color: "#fff",
                                border: "1px solid #374151",
                                borderRadius: 4,
                                padding: "4px 6px",
                                fontSize: 12,
                            }}
                        />
                    ) : (
                        // Project/folder select button
                        <button
                            onClick={() => onSelect(node.id)}
                            style={{
                                flex: 1,
                                minWidth: 0,
                                background: "none",
                                border: "none",
                                color: isActive ? "#fff" : "#cbd5e1",
                                textAlign: "left",
                                padding: "8px 6px",
                                cursor: "pointer",
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <span>📁</span>
                            <span
                                style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                {node.name}
              </span>
                        </button>
                    )}
                </div>

                {/* Row actions */}
                <div style={{ display: "flex", gap: 4, marginLeft: 6 }}>
                    <button
                        onClick={() => setAddingChild((v) => !v)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#86efac",
                            cursor: "pointer",
                            fontSize: 12,
                        }}
                        title="Add subfolder"
                    >
                        ＋
                    </button>

                    <button
                        onClick={() => setEditing(true)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#93c5fd",
                            cursor: "pointer",
                            fontSize: 12,
                        }}
                        title="Rename"
                    >
                        ✏️
                    </button>

                    <button
                        onClick={() => onDelete(node.id)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#fca5a5",
                            cursor: "pointer",
                            fontSize: 12,
                        }}
                        title="Delete"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            {/* Add child input */}
            {addingChild && (
                <div style={{ paddingLeft: 24 + depth * 14, paddingRight: 8, marginBottom: 6 }}>
                    <input
                        value={childName}
                        autoFocus
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="Subfolder name..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                onAddChild(node.id, childName);
                                setChildName("");
                                setAddingChild(false);
                                setCollapsed(false);
                            }

                            if (e.key === "Escape") {
                                setChildName("");
                                setAddingChild(false);
                            }
                        }}
                        style={{
                            width: "100%",
                            background: "#1f2937",
                            color: "#fff",
                            border: "1px solid #374151",
                            borderRadius: 4,
                            padding: "6px 8px",
                            fontSize: 12,
                        }}
                    />

                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <button
                            onClick={() => {
                                onAddChild(node.id, childName);
                                setChildName("");
                                setAddingChild(false);
                                setCollapsed(false);
                            }}
                            style={{
                                background: "#2563eb",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                padding: "4px 8px",
                                fontSize: 11,
                                cursor: "pointer",
                            }}
                        >
                            Add
                        </button>

                        <button
                            onClick={() => {
                                setChildName("");
                                setAddingChild(false);
                            }}
                            style={{
                                background: "#374151",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                padding: "4px 8px",
                                fontSize: 11,
                                cursor: "pointer",
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Recursive children */}
            {!collapsed &&
                (node.children || []).map((child) => (
                    <TreeNode
                        key={child.id}
                        node={child}
                        depth={depth + 1}
                        activeId={activeId}
                        onSelect={onSelect}
                        onRename={onRename}
                        onDelete={onDelete}
                        onAddChild={onAddChild}
                    />
                ))}
        </div>
    );
}