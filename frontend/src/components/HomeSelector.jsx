import React from "react";

export default function HomeSelector({ onSelect }) {
    return (
        <div style={styles.wrapper}>
            <div style={styles.card}>
                <div style={styles.badge}>QA WORKFLOWS</div>
                <h1 style={styles.title}>Welcome to QAgen</h1>
                <p style={styles.subtitle}>
                    Choose the workflow you want to start with.
                </p>

                <div style={styles.grid}>
                    <button
                        style={styles.optionCard}
                        onClick={() => onSelect("testcases")}
                    >
                        <div style={styles.icon}>🧪</div>
                        <div style={styles.optionTitle}>Generate Test Cases</div>
                        <div style={styles.optionText}>
                            Create AI-generated positive, negative, boundary, and edge test
                            cases from requirements.
                        </div>
                    </button>

                    <button
                        style={styles.optionCard}
                        onClick={() => onSelect("logs")}
                    >
                        <div style={styles.icon}>📋</div>
                        <div style={styles.optionTitle}>Analyze Logs</div>
                        <div style={styles.optionText}>
                            Paste logs or upload log files and get AI-powered issue summaries,
                            error detection, and root-cause hints.
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
    },
    card: {
        width: "100%",
        maxWidth: "920px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "20px",
        padding: "40px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
    },
    badge: {
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "#6b7280",
        marginBottom: "12px",
    },
    title: {
        margin: 0,
        fontSize: "40px",
        fontWeight: 800,
        color: "#0f172a",
    },
    subtitle: {
        marginTop: "10px",
        marginBottom: "28px",
        fontSize: "16px",
        color: "#64748b",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "18px",
    },
    optionCard: {
        textAlign: "left",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        padding: "22px",
        background: "#f8fafc",
        cursor: "pointer",
        transition: "0.2s ease",
    },
    icon: {
        fontSize: "28px",
        marginBottom: "14px",
    },
    optionTitle: {
        fontSize: "20px",
        fontWeight: 700,
        color: "#0f172a",
        marginBottom: "8px",
    },
    optionText: {
        fontSize: "14px",
        lineHeight: 1.6,
        color: "#64748b",
    },
};