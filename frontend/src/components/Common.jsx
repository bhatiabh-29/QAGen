import React, { useRef, useState } from "react";

export const STATUS_OPTIONS = ["Untested","Passed","Failed","Retest","Blocked","Skipped","Exception","Pending"];

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function Btn({ children, onClick, disabled, loading, small, danger, secondary, blue, type = "button" }) {
  const bg = danger ? "#fee2e2" : secondary ? "#f3f4f6" : blue ? "#3b82f6" : disabled ? "#e5e7eb" : "#111827";
  const color = danger ? "#991b1b" : secondary ? "#374151" : disabled ? "#9ca3af" : "#fff";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: small ? "6px 12px" : "11px 22px",
        background: bg,
        color,
        border: "none",
        borderRadius: 8,
        fontSize: small ? 12 : 14,
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
        opacity: disabled || loading ? 0.7 : 1
      }}
    >
      {loading && <span style={{ width: 13, height: 13, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%" }} />}
      {children}
    </button>
  );
}


export function Label({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase", marginBottom: 3 }}>{children}</div>;
}

export function Modal({ title, children, onClose, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 28, maxWidth: wide ? 760 : 460, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#111827" }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function Badge({ type }) {
  const colors = {
    Positive: { bg: "#d1fae5", color: "#065f46" },
    Negative: { bg: "#fee2e2", color: "#991b1b" },
    Boundary: { bg: "#fef3c7", color: "#92400e" },
    Edge: { bg: "#ede9fe", color: "#5b21b6" }
  };
  const c = colors[type] || colors.Positive;
  return <span style={{ background: c.bg, color: c.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{type}</span>;
}

export function SourceBadge({ source }) {
  const isManual = source === "Manual";
  return <span style={{ background: isManual ? "#eef2ff" : "#eff6ff", color: isManual ? "#4338ca" : "#1d4ed8", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{isManual ? "Manual" : "AI"}</span>;
}

export function StatusBadge({ status }) {
  const map = {
    Untested: { bg: "#f3f4f6", color: "#6b7280" },
    Passed: { bg: "#dcfce7", color: "#166534" },
    Failed: { bg: "#fee2e2", color: "#991b1b" },
    Retest: { bg: "#fef3c7", color: "#92400e" },
    Blocked: { bg: "#e5e7eb", color: "#374151" },
    Skipped: { bg: "#dbeafe", color: "#1d4ed8" },
    Exception: { bg: "#ffedd5", color: "#9a3412" },
    Pending: { bg: "#f3e8ff", color: "#7e22ce" }
  };
  const c = map[status] || map.Untested;
  return <span style={{ background: c.bg, color: c.color, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{status}</span>;
}

export function EditField({ label, value, onChange, multiline, select, placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <Label>{label}</Label>
      {select ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 7, padding: "10px 12px", fontSize: 13 }}>
          {select.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : multiline ? (
        <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 7, padding: "10px 12px", fontSize: 13, minHeight: 70, resize: "vertical" }} />
      ) : (
        <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 7, padding: "10px 12px", fontSize: 13 }} />
      )}
    </div>
  );
}

export function FileAttachment({ attachments, onAdd, onRemove }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  function handleFiles(files) {
    const allowed = ["image/png","image/jpeg","image/jpg","image/gif","image/webp","application/pdf"];
    Array.from(files).forEach((file) => {
      if (!allowed.includes(file.type)) return;
      const reader = new FileReader();
      reader.onload = () => onAdd({ id: generateId(), name: file.name, type: file.type, size: file.size, dataUrl: reader.result });
      reader.readAsDataURL(file);
    });
  }
  return (
    <div style={{ marginTop: 10 }}>
      <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }} onClick={() => inputRef.current.click()} style={{ border: `2px dashed ${dragging ? "#3b82f6" : "#e5e7eb"}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", background: dragging ? "#eff6ff" : "#fafafa" }}>
        📎 Attach files
        <input ref={inputRef} type="file" multiple accept="image/*,.pdf" style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
      </div>
      {attachments.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>{attachments.map((f) => <div key={f.id} style={{ background: "#f3f4f6", borderRadius: 8, padding: "5px 10px", fontSize: 12 }}>{f.name} <button onClick={() => onRemove(f.id)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}>✕</button></div>)}</div>}
    </div>
  );
}

export function EvidenceUploader({ evidence = [], onAdd, onRemove }) {
  const inputRef = useRef();
  function handleFiles(files) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => onAdd({ id: generateId(), name: file.name, type: file.type, size: file.size, dataUrl: reader.result, uploadedAt: Date.now() });
      reader.readAsDataURL(file);
    });
  }
  return (
    <div style={{ marginTop: 10 }}>
      <div onClick={() => inputRef.current.click()} style={{ border: "1.5px dashed #d1d5db", borderRadius: 10, padding: "12px 14px", background: "#fafafa", cursor: "pointer" }}>
        📎 Attach evidence
        <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
      </div>
      {evidence.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>{evidence.map((f) => <div key={f.id} style={{ background: "#f3f4f6", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>{f.name} <button onClick={() => onRemove(f.id)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}>✕</button></div>)}</div>}
    </div>
  );
}

export function AttachmentViewer({ attachments = [] }) {
    const [preview, setPreview] = useState(null);

    function openAttachment(file) {
        if (!file?.dataUrl) return;

        if (file.type?.startsWith("image/")) {
            setPreview(file);
            return;
        }

        const win = window.open();
        if (win) {
            win.document.write(`
        <iframe
          src="${file.dataUrl}"
          frameborder="0"
          style="width:100vw;height:100vh;border:none;"
        ></iframe>
      `);
        }
    }

    function downloadAttachment(file) {
        if (!file?.dataUrl) return;
        const a = document.createElement("a");
        a.href = file.dataUrl;
        a.download = file.name || "attachment";
        a.click();
    }

    return (
        <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {attachments.map((file) => (
                    <div
                        key={file.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "#f3f4f6",
                            borderRadius: 10,
                            padding: "8px 10px",
                            fontSize: 12,
                        }}
                    >
                        <span>{file.type === "application/pdf" ? "📄" : "🖼️"}</span>
                        <span
                            style={{
                                maxWidth: 180,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontWeight: 600,
                                color: "#374151",
                            }}
                        >
              {file.name}
            </span>

                        <button
                            onClick={() => openAttachment(file)}
                            style={{
                                border: "none",
                                background: "#e5e7eb",
                                borderRadius: 6,
                                padding: "4px 8px",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 600,
                            }}
                        >
                            View
                        </button>

                        <button
                            onClick={() => downloadAttachment(file)}
                            style={{
                                border: "none",
                                background: "#dbeafe",
                                color: "#1d4ed8",
                                borderRadius: 6,
                                padding: "4px 8px",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 600,
                            }}
                        >
                            Download
                        </button>
                    </div>
                ))}
            </div>

            {preview && (
                <div
                    onClick={() => setPreview(null)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.75)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2000,
                        padding: 24,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            padding: 16,
                            maxWidth: "90vw",
                            maxHeight: "90vh",
                        }}
                    >
                        <div style={{ marginBottom: 10, fontWeight: 700 }}>{preview.name}</div>
                        <img
                            src={preview.dataUrl}
                            alt={preview.name}
                            style={{
                                maxWidth: "80vw",
                                maxHeight: "75vh",
                                display: "block",
                                borderRadius: 8,
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export function AttachmentPreviewList({ files = [], title = "Attachments", compact = false }) {
    const [preview, setPreview] = useState(null);

    function openFile(file) {
        if (!file?.dataUrl) return;

        if (file.type?.startsWith("image/")) {
            setPreview(file);
            return;
        }

        const win = window.open();
        if (win) {
            win.document.write(`
        <iframe
          src="${file.dataUrl}"
          frameborder="0"
          style="width:100vw;height:100vh;border:none;"
        ></iframe>
      `);
        }
    }

    function downloadFile(file) {
        if (!file?.dataUrl) return;
        const a = document.createElement("a");
        a.href = file.dataUrl;
        a.download = file.name || "attachment";
        a.click();
    }

    if (!files.length) return null;

    const cardWidth = compact ? 180 : 220;
    const previewHeight = compact ? 100 : 130;

    return (
        <>
            <div style={{ marginTop: 12 }}>
                <div
                    style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#9ca3af",
                        marginBottom: 8,
                    }}
                >
                    {title}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {files.map((file) => {
                        const isImage = file.type?.startsWith("image/");
                        return (
                            <div
                                key={file.id}
                                style={{
                                    width: cardWidth,
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 12,
                                    overflow: "hidden",
                                    background: "#fff",
                                }}
                            >
                                <div
                                    style={{
                                        height: previewHeight,
                                        background: "#f9fafb",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderBottom: "1px solid #f3f4f6",
                                    }}
                                >
                                    {isImage ? (
                                        <img
                                            src={file.dataUrl}
                                            alt={file.name}
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "100%",
                                                objectFit: "cover",
                                                width: "100%",
                                                height: "100%",
                                            }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: 42 }}>📄</div>
                                    )}
                                </div>

                                <div style={{ padding: 10 }}>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: "#374151",
                                            marginBottom: 8,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                        title={file.name}
                                    >
                                        {file.name}
                                    </div>

                                    <div style={{ display: "flex", gap: 6 }}>
                                        <button
                                            onClick={() => openFile(file)}
                                            style={{
                                                border: "none",
                                                background: "#e5e7eb",
                                                borderRadius: 6,
                                                padding: "5px 10px",
                                                cursor: "pointer",
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                        >
                                            View
                                        </button>

                                        <button
                                            onClick={() => downloadFile(file)}
                                            style={{
                                                border: "none",
                                                background: "#dbeafe",
                                                color: "#1d4ed8",
                                                borderRadius: 6,
                                                padding: "5px 10px",
                                                cursor: "pointer",
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                        >
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {preview && (
                <div
                    onClick={() => setPreview(null)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.78)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2000,
                        padding: 24,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            padding: 16,
                            maxWidth: "92vw",
                            maxHeight: "92vh",
                        }}
                    >
                        <div style={{ marginBottom: 10, fontWeight: 700, color: "#111827" }}>
                            {preview.name}
                        </div>
                        <img
                            src={preview.dataUrl}
                            alt={preview.name}
                            style={{
                                maxWidth: "85vw",
                                maxHeight: "78vh",
                                display: "block",
                                borderRadius: 8,
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
