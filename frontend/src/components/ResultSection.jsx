import React from "react";

// --------------------------------------------------
// ResultSection
// Reusable card used in log analysis output.
// It can render either:
// - a simple text value
// - or a list of items
// --------------------------------------------------

export default function ResultSection({ title, content }) {
    // If content is an array, render as bullet list.
    const items = Array.isArray(content) ? content : null;

    return (
        <div
            style={{
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 14,
            }}
        >
            {/* Section title */}
            <div
                style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 8,
                }}
            >
                {title}
            </div>

            {/* Render list content */}
            {items ? (
                items.length ? (
                    <ul
                        style={{
                            margin: 0,
                            paddingLeft: 18,
                            color: "#374151",
                            fontSize: 13,
                            lineHeight: 1.7,
                        }}
                    >
                        {items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                ) : (
                    <div style={{ color: "#6b7280", fontSize: 13 }}>
                        No items found.
                    </div>
                )
            ) : (
                // Render plain text content
                <div
                    style={{
                        color: "#374151",
                        fontSize: 13,
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.7,
                    }}
                >
                    {content || "No result."}
                </div>
            )}
        </div>
    );
}