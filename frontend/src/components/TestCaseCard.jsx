import React, { useState } from "react";
import {
    Badge,
    Btn,
    EditField,
    EvidenceUploader,
    Label,
    SourceBadge,
    StatusBadge,
    STATUS_OPTIONS,
    AttachmentPreviewList,
} from "./Common";

function Section({ label, value, highlight }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <Label>{label}</Label>
            <div
                style={{
                    fontSize: 13,
                    color: highlight ? "#065f46" : "#374151",
                    background: highlight ? "#f0fdf4" : "#f9fafb",
                    borderRadius: 10,
                    padding: "12px 14px",
                    lineHeight: 1.7,
                    border: highlight ? "1px solid #bbf7d0" : "1px solid #f3f4f6",
                    whiteSpace: "pre-wrap",
                }}
            >
                {value}
            </div>
        </div>
    );
}

function Pill({ text, bg, color }) {
    return (
        <span
            style={{
                fontSize: 11,
                fontWeight: 700,
                color,
                background: bg,
                padding: "4px 8px",
                borderRadius: 999,
            }}
        >
      {text}
    </span>
    );
}

export default function TestCaseCard({ tc, onEdit, onDelete }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(tc);

    function saveEdit() {
        const updated = {
            ...draft,
            executedAt:
                draft.status !== "Untested" ||
                draft.executionNotes ||
                draft.actualResult ||
                (draft.evidence || []).length
                    ? Date.now()
                    : draft.executedAt || null,
        };
        onEdit(updated);
        setDraft(updated);
        setEditing(false);
    }

    function cancelEdit() {
        setDraft(tc);
        setEditing(false);
    }

    if (editing) {
        return (
            <div
                style={{
                    background: "#fff",
                    border: "2px solid #3b82f6",
                    borderRadius: 14,
                    marginBottom: 12,
                    padding: 18,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
          <span style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700 }}>
            EDITING {tc.id}
          </span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <Btn small secondary onClick={cancelEdit}>
                            Cancel
                        </Btn>
                        <Btn small blue onClick={saveEdit}>
                            Save Changes
                        </Btn>
                    </div>
                </div>

                <EditField
                    label="Title"
                    value={draft.title}
                    onChange={(v) => setDraft({ ...draft, title: v })}
                />
                <EditField
                    label="Feature"
                    value={draft.feature || "General"}
                    onChange={(v) => setDraft({ ...draft, feature: v })}
                />
                <EditField
                    label="Source"
                    value={draft.source}
                    onChange={(v) => setDraft({ ...draft, source: v })}
                    select={["AI", "Manual"]}
                />
                <EditField
                    label="Test Type"
                    value={draft.testType}
                    onChange={(v) => setDraft({ ...draft, testType: v })}
                    select={["Positive", "Negative", "Boundary", "Edge"]}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <EditField
                        label="Priority"
                        value={draft.priority || "Medium"}
                        onChange={(v) => setDraft({ ...draft, priority: v })}
                        select={["Low", "Medium", "High", "Critical"]}
                    />
                    <EditField
                        label="Severity"
                        value={draft.severity || "Medium"}
                        onChange={(v) => setDraft({ ...draft, severity: v })}
                        select={["Low", "Medium", "High", "Critical"]}
                    />
                    <EditField
                        label="Automation Candidate"
                        value={draft.automationCandidate || "Maybe"}
                        onChange={(v) => setDraft({ ...draft, automationCandidate: v })}
                        select={["Yes", "No", "Maybe"]}
                    />
                </div>

                <EditField
                    label="Preconditions"
                    value={draft.preconditions}
                    onChange={(v) => setDraft({ ...draft, preconditions: v })}
                    multiline
                />

                <div style={{ marginBottom: 14 }}>
                    <Label>Steps</Label>
                    {(draft.steps || []).map((step, index) => (
                        <div
                            key={index}
                            style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}
                        >
              <span style={{ fontSize: 12, color: "#9ca3af", minWidth: 22, marginTop: 10 }}>
                {index + 1}.
              </span>
                            <textarea
                                value={step}
                                onChange={(e) => {
                                    const steps = [...(draft.steps || [])];
                                    steps[index] = e.target.value;
                                    setDraft({ ...draft, steps });
                                }}
                                style={{
                                    flex: 1,
                                    border: "1.5px solid #e5e7eb",
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    fontSize: 13,
                                    minHeight: 44,
                                    resize: "vertical",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const steps = (draft.steps || []).filter((_, i) => i !== index);
                                    setDraft({ ...draft, steps: steps.length ? steps : [""] });
                                }}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#ef4444",
                                    cursor: "pointer",
                                    fontSize: 16,
                                    paddingTop: 8,
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => setDraft({ ...draft, steps: [...(draft.steps || []), ""] })}
                        style={{
                            fontSize: 12,
                            color: "#2563eb",
                            background: "none",
                            border: "1px dashed #bfdbfe",
                            borderRadius: 8,
                            padding: "6px 12px",
                            cursor: "pointer",
                        }}
                    >
                        + Add Step
                    </button>
                </div>

                <EditField
                    label="Expected Result"
                    value={draft.expectedResult}
                    onChange={(v) => setDraft({ ...draft, expectedResult: v })}
                    multiline
                />

                <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #f3f4f6" }}>
                    <Label>Execution</Label>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                        <div>
                            <Label>Status</Label>
                            <select
                                value={draft.status || "Untested"}
                                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                                style={{
                                    width: "100%",
                                    border: "1.5px solid #e5e7eb",
                                    borderRadius: 8,
                                    padding: "8px 10px",
                                    fontSize: 13,
                                    background: "#fff",
                                }}
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label>Executed By</Label>
                            <input
                                value={draft.executedBy || ""}
                                onChange={(e) => setDraft({ ...draft, executedBy: e.target.value })}
                                style={{
                                    width: "100%",
                                    border: "1.5px solid #e5e7eb",
                                    borderRadius: 8,
                                    padding: "8px 10px",
                                    fontSize: 13,
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                        <div>
                            <Label>Executed Date</Label>
                            <input
                                type="date"
                                value={draft.executedDate || ""}
                                onChange={(e) => setDraft({ ...draft, executedDate: e.target.value })}
                                style={{
                                    width: "100%",
                                    border: "1.5px solid #e5e7eb",
                                    borderRadius: 8,
                                    padding: "8px 10px",
                                    fontSize: 13,
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", alignItems: "end", paddingBottom: 2 }}>
                            <StatusBadge status={draft.status || "Untested"} />
                        </div>
                    </div>

                    <EditField
                        label="Actual Result"
                        value={draft.actualResult || ""}
                        onChange={(v) => setDraft({ ...draft, actualResult: v })}
                        multiline
                    />

                    <EditField
                        label="Execution Notes"
                        value={draft.executionNotes || ""}
                        onChange={(v) => setDraft({ ...draft, executionNotes: v })}
                        multiline
                    />

                    <EvidenceUploader
                        evidence={draft.evidence || []}
                        onAdd={(file) =>
                            setDraft({
                                ...draft,
                                evidence: [...(draft.evidence || []), file],
                                executedAt: Date.now(),
                            })
                        }
                        onRemove={(id) =>
                            setDraft({
                                ...draft,
                                evidence: (draft.evidence || []).filter((f) => f.id !== id),
                            })
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                background: "#fff",
                border: "1.5px solid #e5e7eb",
                borderRadius: 14,
                marginBottom: 12,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    width: "75%",
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    textAlign: "left",
                    flexWrap: "wrap",
                }}
            >
                <div
                    onClick={() => setOpen((o) => !o)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flex: "1 1 320px",
                        minWidth: 0,
                        cursor: "pointer",
                    }}
                >
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, minWidth: 50 }}>
            {tc.id}
          </span>

                    <div style={{ minWidth: 0 }}>
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#111827",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {tc.title}
                        </div>
                        <div
                            style={{
                                fontSize: 12,
                                color: "#6b7280",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                marginTop: 2,
                            }}
                        >
                            {tc.feature || "General"}
                        </div>
                    </div>
                </div>

                <div  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                    marginLeft: "auto",
                    maxWidth: "100%",
                }}>
                    <SourceBadge source={tc.source || "AI"} />
                    <StatusBadge status={tc.status || "Untested"} />
                    <Badge type={tc.testType} />
                    <Pill text={`Priority: ${tc.priority || "Medium"}`} bg="#f3e8ff" color="#7c3aed" />
                    <Pill text={`Severity: ${tc.severity || "Medium"}`} bg="#fef3c7" color="#b45309" />
                    <Pill
                        text={`Automation: ${tc.automationCandidate || "Maybe"}`}
                        bg={
                            tc.automationCandidate === "Yes"
                                ? "#dcfce7"
                                : tc.automationCandidate === "No"
                                    ? "#fee2e2"
                                    : "#e0f2fe"
                        }
                        color={
                            tc.automationCandidate === "Yes"
                                ? "#166534"
                                : tc.automationCandidate === "No"
                                    ? "#991b1b"
                                    : "#075985"
                        }
                    />

                    <button
                        type="button"
                        onClick={() => {
                            setEditing(true);
                            setOpen(true);
                        }}
                        style={{
                            background: "#f3f4f6",
                            border: "none",
                            borderRadius: 8,
                            padding: "5px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#374151",
                            cursor: "pointer",
                        }}
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            if (window.confirm("Are you sure you want to delete this test case?")) {
                                onDelete(tc.id);
                            }
                        }}
                        style={{
                            background: "#fee2e2",
                            color: "#991b1b",
                            border: "none",
                            borderRadius: 8,
                            padding: "5px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>

            {open && (
                <div style={{ padding: "18px", borderTop: "1px solid #f3f4f6" }}>
                    <Section label="Feature" value={tc.feature || "General"} />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                        <Section label="Priority" value={tc.priority || "Medium"} />
                        <Section label="Severity" value={tc.severity || "Medium"} />
                        <Section label="Automation Candidate" value={tc.automationCandidate || "Maybe"} />
                    </div>

                    <Section label="Preconditions" value={tc.preconditions || "No preconditions added."} />

                    <div style={{ marginBottom: 14 }}>
                        <Label>Steps</Label>
                        {(tc.steps || []).length === 0 ? (
                            <div
                                style={{
                                    fontSize: 13,
                                    color: "#9ca3af",
                                    background: "#f9fafb",
                                    border: "1px solid #f3f4f6",
                                    borderRadius: 10,
                                    padding: "12px 14px",
                                }}
                            >
                                No steps added.
                            </div>
                        ) : (
                            <ol
                                style={{
                                    margin: 0,
                                    paddingLeft: 32,
                                    background: "#f9fafb",
                                    border: "1px solid #f3f4f6",
                                    borderRadius: 10,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    paddingRight: 14,
                                }}
                            >
                                {(tc.steps || []).map((step, index) => (
                                    <li
                                        key={index}
                                        style={{
                                            fontSize: 13,
                                            color: "#374151",
                                            marginBottom: 8,
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>

                    <Section label="Expected Result" value={tc.expectedResult || "No expected result added."} highlight />
                    <Section label="Actual Result" value={tc.actualResult || "No actual result added yet."} />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Section label="Executed By" value={tc.executedBy || "Not specified"} />
                        <Section label="Executed Date" value={tc.executedDate || "Not specified"} />
                    </div>

                    <Section label="Execution Notes" value={tc.executionNotes || "No execution notes yet."} />

                    <div>
                        <Label>Evidence</Label>
                        {(tc.evidence || []).length === 0 ? (
                            <div style={{ fontSize: 13, color: "#9ca3af" }}>No evidence attached yet.</div>
                        ) : (
                            <AttachmentPreviewList
                                files={tc.evidence || []}
                                title="Execution Evidence"
                                compact={false}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}