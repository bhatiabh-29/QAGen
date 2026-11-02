import React, { useState } from "react";
import TreeNode from "./TreeNode";

// --------------------------------------------------
// Sidebar
// Left-side project navigation.
// Handles:
// - create project
// - show all sessions
// - render project tree
// --------------------------------------------------

export default function Sidebar({
                                    projects,
                                    activeProjectId,
                                    onSelectProject,
                                    onCreateProject,
                                    onRenameProject,
                                    onDeleteProject,
                                    onAddSubProject,
                                }) {
    const [newName, setNewName] = useState("");

    return (
        <aside
            style={{
                width: 230,
                flexShrink: 0,
                background: "#111827",
                display: "flex",
                flexDirection: "column",
                minHeight: "calc(100vh - 54px)",
            }}
        >
            {/* Sidebar title */}
            <div
                style={{
                    padding: "16px 14px 8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
        <span
            style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#6b7280",
                textTransform: "uppercase",
            }}
        >
          Projects
        </span>
            </div>

            {/* New project input */}
            <div style={{ padding: "8px 12px" }}>
                <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Project name..."
                    style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 6,
                        padding: "6px 10px",
                        color: "#fff",
                        fontSize: 12,
                    }}
                />

                <button
                    onClick={async () => {
                        if (!newName.trim()) return;
                        await onCreateProject(newName.trim());
                        setNewName("");
                    }}
                    style={{
                        marginTop: 6,
                        width: "100%",
                        background: "#3b82f6",
                        border: "none",
                        borderRadius: 5,
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "5px 0",
                        cursor: "pointer",
                    }}
                >
                    Create
                </button>
            </div>

            {/* All sessions shortcut */}
            <button
                onClick={() => onSelectProject(null)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 14px",
                    background: activeProjectId === null ? "rgba(59,130,246,0.15)" : "none",
                    border: "none",
                    color: activeProjectId === null ? "#fff" : "#9ca3af",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    fontSize: 13,
                }}
            >
                🗂 All Sessions
            </button>

            {/* Project tree */}
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
                {projects.map((node) => (
                    <TreeNode
                        key={node.id}
                        node={node}
                        activeId={activeProjectId}
                        onSelect={onSelectProject}
                        onRename={onRenameProject}
                        onDelete={onDeleteProject}
                        onAddChild={onAddSubProject}
                    />
                ))}
            </div>
        </aside>
    );
}