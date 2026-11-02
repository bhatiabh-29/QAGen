import React from "react";

// --------------------------------------------------
// TopNav
// Reusable top navigation bar.
// Shows:
// - app logo
// - current project name
// - breadcrumb
// - active navigation state
// --------------------------------------------------

export default function TopNav({
                                   projectName,
                                   breadcrumb = [],
                                   page,
                                   navItems,
                                   onLogoClick,
                                   onNavigate,
                               }) {
    return (
        <header
            style={{
                background: "#111827",
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 54,
            }}
        >
            {/* Left side: logo + project context */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                <button
                    className="nav-btn"
                    onClick={onLogoClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            width: 28,
                            height: 28,
                            background: "#3b82f6",
                            borderRadius: 7,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                        }}
                    >
                        ⬡
                    </div>

                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
            QA<span style={{ color: "#3b82f6" }}>gen</span>
          </span>
                </button>

                {/* Project name */}
                {projectName && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 0,
                        }}
                    >
                        <span style={{ color: "#4b5563" }}>/</span>
                        <span
                            style={{
                                color: "#e5e7eb",
                                fontSize: 14,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 220,
                            }}
                        >
              {projectName}
            </span>
                    </div>
                )}

                {/* Breadcrumb */}
                {!!breadcrumb.length && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            minWidth: 0,
                        }}
                    >
                        <span style={{ color: "#374151" }}>•</span>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                minWidth: 0,
                                overflow: "hidden",
                            }}
                        >
                            {breadcrumb.map((item, idx) => (
                                <React.Fragment key={`${item}-${idx}`}>
                                    {idx > 0 && (
                                        <span style={{ color: "#4b5563", fontSize: 12 }}>/</span>
                                    )}
                                    <span
                                        style={{
                                            color: idx === breadcrumb.length - 1 ? "#93c5fd" : "#9ca3af",
                                            fontSize: 12,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                    {item}
                  </span>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right side nav */}
            <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {navItems.map(([key, label]) => {
                    const active = page === key;

                    return (
                        <button
                            key={key}
                            className="nav-btn"
                            onClick={() => onNavigate(key)}
                            style={{
                                color: active ? "#fff" : "#9ca3af",
                                fontWeight: active ? 600 : 500,
                                fontSize: 13,
                                padding: "7px 12px",
                                borderRadius: 8,
                                background: active ? "rgba(59,130,246,0.18)" : "transparent",
                                border: active
                                    ? "1px solid rgba(96,165,250,0.35)"
                                    : "1px solid transparent",
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </nav>
        </header>
    );
}