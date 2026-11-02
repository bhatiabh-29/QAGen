import React from "react";
import { AttachmentPreviewList } from "./Common";

export default function PrettyRequirementCard({ requirement, attachments = [] }) {
    const raw = (requirement || "").trim();

    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 20,
                marginBottom: 18,
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 14,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#9ca3af",
                            marginBottom: 4,
                        }}
                    >
                        Requirement
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                        Source Details
                    </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span
              style={{
                  background: "#f3f4f6",
                  color: "#374151",
                  borderRadius: 999,
                  padding: "6px 10px",
                  fontSize: 12,
                  fontWeight: 600,
              }}
          >
            {raw.length} chars
          </span>
                    <span
                        style={{
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            borderRadius: 999,
                            padding: "6px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                        }}
                    >
            {attachments.length} attachment{attachments.length !== 1 ? "s" : ""}
          </span>
                </div>
            </div>

            <div
                style={{
                    background: "#f9fafb",
                    border: "1px solid #f3f4f6",
                    borderRadius: 12,
                    padding: 16,
                    whiteSpace: "pre-wrap",
                    color: raw ? "#374151" : "#9ca3af",
                    marginBottom: attachments.length ? 16 : 0,
                    minHeight: 72,
                }}
            >
                {raw || "No requirement text stored for this session."}
            </div>

            <AttachmentPreviewList files={attachments} title="Requirement Attachments" compact={true} />
        </div>
    );
}