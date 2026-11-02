import React from "react";

// --------------------------------------------------
// ProjectDashboard
// Landing page for a selected project.
// Shows the main workflows inside the project.
// --------------------------------------------------

const dashboardCardStyle = {
    textAlign: "left",
    background: "#fff",
    border: "1.5px solid #e5e7eb",
    borderRadius: 18,
    padding: "22px",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
};

const dashboardIconStyle = {
    fontSize: 28,
    marginBottom: 12,
};

const dashboardTitleStyle = {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 8,
};

const dashboardTextStyle = {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.6,
};

const statsCardStyle = {
    background: "#fff",
    border: "1.5px solid #e5e7eb",
    borderRadius: 14,
    padding: "14px 16px",
};

export default function ProjectDashboard({
                                             projectName,
                                             onOpenGenerate,
                                             onOpenLogs,
                                             onOpenSaved,
                                             savedCount = 0,
                                         }) {
    return (
        <div style={{ maxWidth: 1040 }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1
                    style={{
                        fontSize: 30,
                        fontWeight: 800,
                        color: "#111827",
                        marginBottom: 6,
                    }}
                >
                    {projectName}
                </h1>

                <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
                    Choose a workflow for this project.
                </p>
            </div>

            {/* Small summary cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 12,
                    marginBottom: 20,
                }}
            >
                <div style={statsCardStyle}>
                    <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 700 }}>
                        PROJECT
                    </div>
                    <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, color: "#111827" }}>
                        Active
                    </div>
                </div>

                <div style={statsCardStyle}>
                    <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 700 }}>
                        SAVED SESSIONS
                    </div>
                    <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, color: "#111827" }}>
                        {savedCount}
                    </div>
                </div>

                <div style={statsCardStyle}>
                    <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 700 }}>
                        WORKFLOWS
                    </div>
                    <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, color: "#111827" }}>
                        3
                    </div>
                </div>
            </div>

            {/* Workflow cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 18,
                }}
            >
                <button onClick={onOpenGenerate} style={dashboardCardStyle}>
                    <div style={dashboardIconStyle}>🧪</div>
                    <div style={dashboardTitleStyle}>Generate Test Cases</div>
                    <div style={dashboardTextStyle}>
                        Create AI-generated positive, negative, boundary, and edge test
                        cases from requirements.
                    </div>
                </button>

                <button onClick={onOpenLogs} style={dashboardCardStyle}>
                    <div style={dashboardIconStyle}>📋</div>
                    <div style={dashboardTitleStyle}>Log Analysis</div>
                    <div style={dashboardTextStyle}>
                        Paste logs or upload files and get issue summaries, warnings, and
                        probable root-cause hints.
                    </div>
                </button>

                <button onClick={onOpenSaved} style={dashboardCardStyle}>
                    <div style={dashboardIconStyle}>💾</div>
                    <div style={dashboardTitleStyle}>Saved Sessions</div>
                    <div style={dashboardTextStyle}>
                        Review saved test case sessions and saved log analyses for this
                        project.
                    </div>
                </button>
            </div>
        </div>
    );
}