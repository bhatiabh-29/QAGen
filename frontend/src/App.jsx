import React, { useEffect, useMemo, useState } from "react";
import PrettyRequirementCard from "./components/RequirementCard";
import TestCaseCard from "./components/TestCaseCard";
import HomeSelector from "./components/HomeSelector";
import ResultSection from "./components/ResultSection";
import ProjectDashboard from "./components/ProjectDashboard";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import ProjectBanner from "./components/ProjectBanner";
import { Btn, EditField, FileAttachment, Modal, generateId } from "./components/Common";
import {
  fetchSessions,
  createSession,
  updateSession,
  moveSessionToTrash,
  restoreSession,
  deleteSessionPermanently,
} from "./api/sessions";
import {
  normalizeTestCase,
  normalizeTestCases,
  defaultManualDraft,
} from "./utils/testCaseHelpers";
import {
  findNodeName,
  findNodeById,
  collectNodeAndDescendantIds,
  buildBreadcrumb,
} from "./utils/appHelpers";
import { exportToExcel } from "./utils/exportHelpers";

const SYSTEM_PROMPT = `You are a senior QA engineer.

Generate comprehensive QA test cases from the requirement.

Return ONLY a valid JSON array.
Do not return markdown.
Do not return explanations.

Each object MUST include ALL of these fields:
- id
- title
- feature
- preconditions
- steps
- expectedResult
- testType
- priority
- severity
- automationCandidate

Use this exact structure:
[
  {
    "id": "TC-001",
    "title": "Clear descriptive title",
    "feature": "Feature name",
    "preconditions": "string",
    "steps": ["step 1", "step 2"],
    "expectedResult": "string",
    "testType": "Positive",
    "priority": "Medium",
    "severity": "Medium",
    "automationCandidate": "Yes"
  }
]

Rules:
- title must never be empty
- feature must be short and meaningful
- steps must always be an array
- expectedResult must never be empty
- testType must be one of: Positive, Negative, Boundary, Edge
- priority must be one of: Low, Medium, High, Critical
- severity must be one of: Low, Medium, High, Critical
- automationCandidate must be one of: Yes, No, Maybe
- suggest automationCandidate based on whether the test is stable, repeatable, and suitable for automation
- generate at least 8 test cases`;

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [saved, setSaved] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [page, setPage] = useState("selector");

  const [requirement, setRequirement] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");

  const [detailEntry, setDetailEntry] = useState(null);
  const [saveModal, setSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);

  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualDraft, setManualDraft] = useState(defaultManualDraft());

  const [logInput, setLogInput] = useState("");
  const [logAttachments, setLogAttachments] = useState([]);
  const [logResult, setLogResult] = useState(null);
  const [logLoading, setLogLoading] = useState(false);
  const [logFocus, setLogFocus] = useState("general");
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [logSaveModal, setLogSaveModal] = useState(false);
  const [logSaveTitle, setLogSaveTitle] = useState("");

  const [error, setError] = useState("");

  async function loadProjectsFromBackend() {
    const res = await fetch(`${getApiBaseUrl()}/api/projects`);
    if (!res.ok) throw new Error("Failed to load projects");

    const data = await res.json();
    setProjects(data);
  }

  async function loadSavedFromBackend() {
    const data = await fetchSessions();
    setSaved(data);
  }

  useEffect(() => {
    (async () => {
      try {
        await loadProjectsFromBackend();
        await loadSavedFromBackend();
      } catch (e) {
        setError(e.message || String(e));
      }
    })();
  }, []);

  function resetWorkingSession() {
    setRequirement("");
    setAttachments([]);
    setResult(null);
    setDetailEntry(null);
    setAiInstruction("");
    setError("");
    setSaveTitle("");

    setLogInput("");
    setLogAttachments([]);
    setLogResult(null);
    setLogLoading(false);
    setLogFocus("general");
    setErrorsOnly(false);
    setLogSaveTitle("");
  }

  async function createProject(name) {
    try {
      const project = {
        id: generateId(),
        name,
        parentId: null,
        createdAt: Date.now(),
      };

      const res = await fetch(`${getApiBaseUrl()}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });

      if (!res.ok) throw new Error("Failed to create project");

      await loadProjectsFromBackend();
      setActiveProjectId(project.id);
      resetWorkingSession();
      setPage("project-dashboard");
      setError("");
    } catch (e) {
      setError(e.message || "Failed to create project.");
    }
  }

  async function createSubProject(parentId, name) {
    try {
      if (!name.trim()) return;

      const child = {
        id: generateId(),
        name: name.trim(),
        parentId,
        createdAt: Date.now(),
      };

      const res = await fetch(`${getApiBaseUrl()}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(child),
      });

      if (!res.ok) throw new Error("Failed to create subproject");

      await loadProjectsFromBackend();
      setActiveProjectId(child.id);
      resetWorkingSession();
      setPage("project-dashboard");
      setError("");
    } catch (e) {
      setError(e.message || "Failed to create subproject.");
    }
  }

  async function renameProject(id, newName) {
    try {
      if (!newName.trim()) return;

      const res = await fetch(`${getApiBaseUrl()}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to rename project");

      await loadProjectsFromBackend();
      setError("");
    } catch (e) {
      setError(e.message || "Failed to rename project.");
    }
  }

  async function deleteProject(id) {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this project/folder?");
      if (!confirmed) return;

      const res = await fetch(`${getApiBaseUrl()}/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete project");

      if (activeProjectId === id) {
        setActiveProjectId(null);
        resetWorkingSession();
        setPage("selector");
      }

      await loadProjectsFromBackend();
      await loadSavedFromBackend();
      setError("");
    } catch (e) {
      setError(e.message || "Failed to delete project.");
    }
  }

  async function callAi({
                          requirementText,
                          attachmentList,
                          instruction,
                          currentTestCases,
                          regenerateFromScratch,
                        }) {
    const payload = {
      systemPrompt: regenerateFromScratch
          ? SYSTEM_PROMPT
          : `${SYSTEM_PROMPT}

Revise the current test cases using the user's instruction.

Important:
- keep all required fields
- every test case must include a non-empty title
- improve titles if needed
- do not omit title, feature, expectedResult, steps, priority, severity, or automationCandidate
- priority must be one of: Low, Medium, High, Critical
- severity must be one of: Low, Medium, High, Critical
- automationCandidate must be one of: Yes, No, Maybe
- return a full updated JSON array only.`,
      requirement: `${requirementText || ""}\n\n${
          !regenerateFromScratch && currentTestCases?.length
              ? `Current Test Cases:\n${JSON.stringify(
                  currentTestCases,
                  null,
                  2
              )}\n\nUser Instruction:\n${instruction || "Improve the current test cases."}`
              : instruction
                  ? `Additional Instruction:\n${instruction}`
                  : ""
      }`,
      attachments: attachmentList || [],
    };

    const resp = await fetch(`${getApiBaseUrl()}/api/generate-test-cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(
          `API Error ${resp.status}: ${data?.error || data?.message || JSON.stringify(data)}`
      );
    }

    const parsed = JSON.parse(
        String(data?.content || "").replace(/```json|```/g, "").trim()
    );

    if (!Array.isArray(parsed)) {
      throw new Error("AI response was not a valid array.");
    }

    const normalized = parsed.map((tc, i) => ({
      ...tc,
      id: tc.id || `TC-${String(i + 1).padStart(3, "0")}`,
      title:
          tc.title ||
          tc.expectedResult ||
          (Array.isArray(tc.steps) && tc.steps[0]) ||
          `Test Case ${i + 1}`,
      feature: tc.feature || "General",
      preconditions: tc.preconditions || "",
      steps: Array.isArray(tc.steps) ? tc.steps : [],
      expectedResult: tc.expectedResult || "",
      testType: tc.testType || "Positive",
      priority: ["Low", "Medium", "High", "Critical"].includes(tc.priority)
          ? tc.priority
          : "Medium",
      severity: ["Low", "Medium", "High", "Critical"].includes(tc.severity)
          ? tc.severity
          : "Medium",
      automationCandidate: ["Yes", "No", "Maybe"].includes(tc.automationCandidate)
          ? tc.automationCandidate
          : "Maybe",
    }));

    return normalizeTestCases(normalized, "AI");
  }

  async function generate() {
    if (!requirement.trim() && attachments.length === 0) {
      setError("Enter requirement text or add attachments.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const testCases = await callAi({
        requirementText: requirement,
        attachmentList: attachments,
        regenerateFromScratch: true,
      });

      setResult({ requirement, attachments, testCases });
      setPage("results");
    } catch (e) {
      setError(e.message || String(e));
    }

    setLoading(false);
  }

  async function analyzeLogs() {
    if (!logInput.trim() && logAttachments.length === 0) {
      setError("Paste logs or attach a log file before analyzing.");
      return;
    }

    setError("");
    setLogLoading(true);
    setLogResult(null);

    try {
      const resp = await fetch(`${getApiBaseUrl()}/api/logs/analyze-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logs: logInput,
          attachments: logAttachments,
          focus: logFocus,
          errorsOnly,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(
            `API Error ${resp.status}: ${data?.error || data?.message || "Failed to analyze logs"}`
        );
      }

      setLogResult(data);
    } catch (e) {
      setError(e.message || "Failed to analyze logs.");
    } finally {
      setLogLoading(false);
    }
  }

  async function modifyWithAi() {
    const currentSession = detailEntry || result;
    if (!currentSession) return;

    if (!aiInstruction.trim()) {
      setError("Enter AI instructions before modifying the test cases.");
      return;
    }

    setError("");
    setAiLoading(true);

    try {
      const updatedCases = await callAi({
        requirementText: currentSession.requirement,
        attachmentList: currentSession.attachments || [],
        currentTestCases: currentSession.testCases || [],
        instruction: aiInstruction,
        regenerateFromScratch: false,
      });

      if (detailEntry) {
        const updatedEntry = {
          ...detailEntry,
          testCases: updatedCases,
          updatedAt: Date.now(),
        };

        setDetailEntry(updatedEntry);
        await updateSession(detailEntry.id, updatedEntry);
        await loadSavedFromBackend();
      } else {
        setResult((prev) => ({ ...prev, testCases: updatedCases }));
      }

      setAiInstruction("");
    } catch (e) {
      setError(e.message || String(e));
    }

    setAiLoading(false);
  }

  async function regenerateCurrent() {
    const currentSession = detailEntry || result;
    if (!currentSession) return;

    setError("");
    setAiLoading(true);

    try {
      const regenerated = await callAi({
        requirementText: currentSession.requirement,
        attachmentList: currentSession.attachments || [],
        instruction: aiInstruction,
        regenerateFromScratch: true,
      });

      if (detailEntry) {
        const updatedEntry = {
          ...detailEntry,
          testCases: regenerated,
          updatedAt: Date.now(),
        };

        setDetailEntry(updatedEntry);
        await updateSession(detailEntry.id, updatedEntry);
        await loadSavedFromBackend();
      } else {
        setResult((prev) => ({ ...prev, testCases: regenerated }));
      }

      setAiInstruction("");
    } catch (e) {
      setError(e.message || String(e));
    }

    setAiLoading(false);
  }

  async function executeSave() {
    if (!activeProjectId) {
      setError("Please create or select a project before saving.");
      return;
    }

    if (!saveTitle.trim() || !result) return;

    const entry = {
      title: saveTitle.trim(),
      requirement: result.requirement,
      attachments: result.attachments || [],
      testCases: normalizeTestCases(result.testCases || []),
      projectId: activeProjectId,
      type: "test-cases",
    };

    try {
      await createSession(entry);
      setSaveModal(false);
      setSaveTitle("");
      setPage("saved");
      await loadSavedFromBackend();
    } catch (e) {
      setError(e.message || String(e));
    }
  }

  async function executeLogSave() {
    if (!activeProjectId) {
      setError("Please create or select a project before saving.");
      return;
    }

    if (!logSaveTitle.trim() || !logResult) return;

    const entry = {
      type: "log-analysis",
      title: logSaveTitle.trim(),
      logs: logInput,
      attachments: logAttachments || [],
      logAnalysis: logResult,
      projectId: activeProjectId,
    };

    try {
      await createSession(entry);
      setLogSaveModal(false);
      setLogSaveTitle("");
      setPage("saved");
      await loadSavedFromBackend();
    } catch (e) {
      setError(e.message || String(e));
    }
  }

  async function handleMoveToRecycleBin(id) {
    try {
      await moveSessionToTrash(id);
      setDeleteModal(null);

      if (detailEntry?.id === id) {
        setDetailEntry(null);
        setPage("saved");
      }

      await loadSavedFromBackend();
    } catch (e) {
      setError(e.message || String(e));
    }
  }

  async function handleRestoreSession(id) {
    try {
      await restoreSession(id);
      await loadSavedFromBackend();
    } catch (e) {
      setError(e.message || String(e));
    }
  }

  async function handleDeleteSessionPermanently(id) {
    try {
      await deleteSessionPermanently(id);
      await loadSavedFromBackend();
    } catch (e) {
      setError(e.message || String(e));
    }
  }

  async function saveManualTestCase() {
    if (!manualDraft.title.trim()) {
      alert("Enter a title for the manual test case.");
      return;
    }

    const tc = normalizeTestCase(
        {
          ...manualDraft,
          id:
              manualDraft.id ||
              `MAN-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
          steps: (manualDraft.steps || []).filter((s) => s.trim()),
          source: "Manual",
        },
        0,
        "Manual"
    );

    if (detailEntry) {
      const updatedEntry = {
        ...detailEntry,
        testCases: [...detailEntry.testCases, tc],
        updatedAt: Date.now(),
      };

      setDetailEntry(updatedEntry);
      await updateSession(detailEntry.id, updatedEntry);
      await loadSavedFromBackend();
    } else if (result) {
      setResult({ ...result, testCases: [...result.testCases, tc] });
    }

    setManualModalOpen(false);
    setManualDraft(defaultManualDraft());
  }

  const activeSaved = useMemo(() => saved.filter((e) => !e.deletedAt), [saved]);
  const recycleBinEntries = useMemo(() => saved.filter((e) => !!e.deletedAt), [saved]);

  const filteredSaved = useMemo(() => {
    if (!activeProjectId) return activeSaved;

    const activeNode = findNodeById(projects, activeProjectId);
    const allowedIds = new Set(collectNodeAndDescendantIds(activeNode));

    return activeSaved.filter((e) => allowedIds.has(e.projectId));
  }, [activeSaved, activeProjectId, projects]);

  const activeProjectName = findNodeName(projects, activeProjectId);
  const breadcrumb = useMemo(() => {
    if (!activeProjectId) return [];
    return buildBreadcrumb(projects, activeProjectId);
  }, [projects, activeProjectId]);

  const currentDisplay = detailEntry || result;

  const stats = currentDisplay?.testCases?.length
      ? {
        total: currentDisplay.testCases.length,
        ai: currentDisplay.testCases.filter((t) => t.source !== "Manual").length,
        manual: currentDisplay.testCases.filter((t) => t.source === "Manual").length,
      }
      : null;

  const navItems = activeProjectId
      ? [
        ["project-dashboard", "Overview"],
        ["home", "Generate"],
        ["logs", "Log Analysis"],
        ["saved", `Saved${filteredSaved.length ? ` (${filteredSaved.length})` : ""}`],
        ["recycle", `Recycle Bin${recycleBinEntries.length ? ` (${recycleBinEntries.length})` : ""}`],
      ]
      : [
        ["selector", "Home"],
        ["saved", `Saved${filteredSaved.length ? ` (${filteredSaved.length})` : ""}`],
        ["recycle", `Recycle Bin${recycleBinEntries.length ? ` (${recycleBinEntries.length})` : ""}`],
      ];

  return (
      <>
        <TopNav
            projectName={activeProjectName}
            breadcrumb={breadcrumb}
            page={page}
            navItems={navItems}
            onLogoClick={() => {
              resetWorkingSession();
              setPage(activeProjectId ? "project-dashboard" : "selector");
            }}
            onNavigate={(key) => setPage(key)}
        />

        <div style={{ display: "flex", minHeight: "calc(100vh - 54px)" }}>
          <Sidebar
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={(id) => {
                setActiveProjectId(id);
                resetWorkingSession();
                setPage(id ? "project-dashboard" : "selector");
              }}
              onCreateProject={createProject}
              onRenameProject={renameProject}
              onDeleteProject={deleteProject}
              onAddSubProject={createSubProject}
          />

          <main style={{ flex: 1, padding: "32px 28px 60px", minWidth: 0 }}>
            {activeProjectName && page !== "recycle" && (
                <ProjectBanner projectName={activeProjectName} />
            )}

            {page === "selector" && !activeProjectId && (
                <div style={{ maxWidth: 920 }}>
                  <HomeSelector onSelect={() => setPage("selector")} />
                </div>
            )}

            {page === "project-dashboard" && activeProjectId && (
                <ProjectDashboard
                    projectName={activeProjectName || "Project"}
                    savedCount={filteredSaved.length}
                    onOpenGenerate={() => setPage("home")}
                    onOpenLogs={() => setPage("logs")}
                    onOpenSaved={() => setPage("saved")}
                />
            )}

            {page === "home" && (
                <div style={{ maxWidth: 780 }}>
                  {!activeProjectId && (
                      <div className="warning-banner" style={{ marginBottom: 16 }}>
                        Please create or select a project before saving test cases.
                      </div>
                  )}

                  <h1 className="page-title">Generate Test Cases</h1>

                  <div className="panel-card" style={{ overflow: "hidden" }}>
                    <div
                        style={{
                          padding: "10px 16px 4px",
                          color: "#9ca3af",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                    >
                      REQUIREMENT
                    </div>

                    <textarea
                        value={requirement}
                        onChange={(e) => setRequirement(e.target.value)}
                        placeholder={"User should login using email and password.\nPassword must be 8+ characters."}
                        style={{
                          width: "100%",
                          minHeight: 160,
                          border: "none",
                          resize: "vertical",
                          padding: "8px 16px 12px",
                          fontSize: 14,
                          color: "#111827",
                          lineHeight: 1.7,
                        }}
                    />

                    <div style={{ padding: "0 16px 14px" }}>
                      <FileAttachment
                          attachments={attachments}
                          onAdd={(f) => setAttachments((a) => [...a, f])}
                          onRemove={(id) => setAttachments((a) => a.filter((f) => f.id !== id))}
                      />
                    </div>

                    <div
                        style={{
                          borderTop: "1px solid #f3f4f6",
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                    >
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                    Positive · Negative · Boundary · Edge cases
                  </span>

                      <Btn
                          onClick={generate}
                          disabled={(!requirement.trim() && attachments.length === 0) || loading}
                          loading={loading}
                      >
                        {loading ? "Generating…" : "Generate Test Cases →"}
                      </Btn>
                    </div>
                  </div>

                  {error && (
                      <div className="error-banner" style={{ marginTop: 16 }}>
                        {error}
                      </div>
                  )}
                </div>
            )}

            {page === "logs" && (
                <div style={{ maxWidth: 960 }}>
                  {!activeProjectId && (
                      <div className="warning-banner" style={{ marginBottom: 16 }}>
                        Please create or select a project before saving analyses.
                      </div>
                  )}

                  <div style={{ marginBottom: 24 }}>
                    <h1 className="page-title">Log Analysis</h1>
                    <p className="page-subtitle">
                      Paste logs or attach files, focus the analysis, and optionally analyze only error lines.
                    </p>
                  </div>

                  <div className="panel-card" style={{ overflow: "hidden", marginBottom: 18 }}>
                    <div
                        style={{
                          padding: "10px 16px 4px",
                          color: "#9ca3af",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                    >
                      LOG INPUT
                    </div>

                    <textarea
                        value={logInput}
                        onChange={(e) => setLogInput(e.target.value)}
                        placeholder={`2026-04-10 09:21:14 ERROR AuthService - Invalid token signature
2026-04-10 09:21:15 WARN LoginController - Retry limit nearing threshold
2026-04-10 09:21:18 ERROR DBConnection - Connection timeout`}
                        style={{
                          width: "100%",
                          minHeight: 220,
                          border: "none",
                          resize: "vertical",
                          padding: "8px 16px 12px",
                          fontSize: 14,
                          color: "#111827",
                          lineHeight: 1.7,
                          boxSizing: "border-box",
                        }}
                    />

                    <div style={{ padding: "0 16px 14px" }}>
                      <FileAttachment
                          attachments={logAttachments}
                          onAdd={(f) => setLogAttachments((a) => [...a, f])}
                          onRemove={(id) => setLogAttachments((a) => a.filter((f) => f.id !== id))}
                      />
                    </div>

                    <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 12,
                          padding: "0 16px 14px",
                        }}
                    >
                      <div>
                        <div className="section-label" style={{ marginBottom: 6 }}>
                          ANALYSIS FOCUS
                        </div>

                        <select
                            value={logFocus}
                            onChange={(e) => setLogFocus(e.target.value)}
                            style={{
                              width: "100%",
                              border: "1.5px solid #e5e7eb",
                              borderRadius: 8,
                              padding: "10px 12px",
                              fontSize: 13,
                              background: "#fff",
                            }}
                        >
                          <option value="general">General</option>
                          <option value="security">Security</option>
                          <option value="performance">Performance</option>
                          <option value="api">API</option>
                          <option value="database">Database</option>
                        </select>
                      </div>

                      <div>
                        <div className="section-label" style={{ marginBottom: 6 }}>
                          FILTER
                        </div>

                        <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              border: "1.5px solid #e5e7eb",
                              borderRadius: 8,
                              padding: "10px 12px",
                              fontSize: 13,
                              color: "#111827",
                              background: "#fff",
                            }}
                        >
                          <input
                              type="checkbox"
                              checked={errorsOnly}
                              onChange={(e) => setErrorsOnly(e.target.checked)}
                          />
                          Analyze errors only
                        </label>
                      </div>
                    </div>

                    <div
                        style={{
                          borderTop: "1px solid #f3f4f6",
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                    >
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                    Supports pasted logs, .log, .txt, .json, .csv, and PDFs
                  </span>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Btn blue onClick={analyzeLogs} loading={logLoading}>
                          {logLoading ? "Analyzing..." : "Analyze Logs"}
                        </Btn>

                        <Btn
                            secondary
                            onClick={() => {
                              setLogInput("");
                              setLogAttachments([]);
                              setLogResult(null);
                              setLogFocus("general");
                              setErrorsOnly(false);
                            }}
                        >
                          Clear
                        </Btn>

                        <Btn
                            onClick={() => {
                              if (!activeProjectId) {
                                setError("Please create or select a project before saving.");
                                return;
                              }
                              if (!logResult) {
                                setError("Run log analysis before saving.");
                                return;
                              }
                              setLogSaveModal(true);
                            }}
                            disabled={!activeProjectId || !logResult}
                        >
                          Save Analysis
                        </Btn>
                      </div>
                    </div>
                  </div>

                  {error && (
                      <div className="error-banner" style={{ marginBottom: 16 }}>
                        {error}
                      </div>
                  )}

                  {logResult && (
                      <div className="panel-card" style={{ padding: 18 }}>
                        <div className="section-label" style={{ marginBottom: 14 }}>
                          ANALYSIS RESULT
                        </div>

                        <div style={{ display: "grid", gap: 14 }}>
                          <ResultSection title="Summary" content={logResult.summary} />
                          <ResultSection title="Errors Found" content={logResult.errorsFound} />
                          <ResultSection title="Warnings Found" content={logResult.warningsFound} />
                          <ResultSection
                              title="Probable Root Cause"
                              content={logResult.probableRootCause}
                          />
                          <ResultSection
                              title="Affected Component / Module"
                              content={logResult.affectedComponent}
                          />
                          <ResultSection
                              title="Suggested Next Checks"
                              content={logResult.suggestedNextSteps}
                          />
                        </div>
                      </div>
                  )}
                </div>
            )}

            {(page === "results" || page === "detail") && currentDisplay && (
                <div style={{ maxWidth: 860 }}>
                  <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 20,
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                  >
                    <div>
                      <h2
                          style={{
                            fontSize: 22,
                            fontWeight: 800,
                            color: "#111827",
                            margin: "0 0 4px",
                          }}
                      >
                        {page === "detail" ? detailEntry.title : "Test Cases"}
                      </h2>

                      <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                        Review, edit, modify with AI, add manual cases, and attach evidence.
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {page === "detail" ? (
                          <Btn
                              secondary
                              onClick={() => {
                                setPage("saved");
                                setDetailEntry(null);
                              }}
                          >
                            ← Saved
                          </Btn>
                      ) : (
                          <Btn
                              secondary
                              onClick={() => {
                                resetWorkingSession();
                                setPage("project-dashboard");
                              }}
                          >
                            ← Back
                          </Btn>
                      )}

                      <Btn
                          secondary
                          onClick={() =>
                              exportToExcel(
                                  detailEntry || {
                                    ...result,
                                    title: saveTitle || "Preview",
                                    createdAt: Date.now(),
                                    updatedAt: Date.now(),
                                  },
                                  activeProjectName || ""
                              )
                          }
                      >
                        ⬇ Export Excel
                      </Btn>

                      {page === "results" && (
                          <Btn
                              onClick={() => {
                                if (!activeProjectId) {
                                  setError("Please create or select a project before saving.");
                                  return;
                                }
                                setSaveModal(true);
                              }}
                              disabled={!activeProjectId}
                          >
                            Save Results
                          </Btn>
                      )}

                      <Btn
                          secondary
                          onClick={() => {
                            setManualDraft(defaultManualDraft());
                            setManualModalOpen(true);
                          }}
                      >
                        + Add Manual Test Case
                      </Btn>
                    </div>
                  </div>

                  {stats && (
                      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                        {[
                          { label: "Total", val: stats.total, color: "#3b82f6" },
                          { label: "AI", val: stats.ai, color: "#2563eb" },
                          { label: "Manual", val: stats.manual, color: "#4338ca" },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="panel-card"
                                style={{
                                  padding: "8px 14px",
                                }}
                            >
                      <span style={{ fontSize: 17, fontWeight: 800, color: s.color }}>
                        {s.val}
                      </span>{" "}
                              <span
                                  style={{
                                    fontSize: 11,
                                    color: "#9ca3af",
                                    fontWeight: 600,
                                  }}
                              >
                        {s.label}
                      </span>
                            </div>
                        ))}
                      </div>
                  )}

                  <PrettyRequirementCard
                      requirement={currentDisplay.requirement}
                      attachments={currentDisplay.attachments || []}
                  />

                  <div className="panel-card" style={{ padding: 16, marginBottom: 18 }}>
                    <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 10,
                          flexWrap: "wrap",
                        }}
                    >
                      <div>
                        <div className="section-label">AI ACTIONS</div>
                        <div
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#111827",
                            }}
                        >
                          Modify existing test cases or regenerate them
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Btn
                            secondary
                            onClick={modifyWithAi}
                            loading={aiLoading}
                            disabled={!currentDisplay.testCases?.length}
                        >
                          Modify with AI
                        </Btn>

                        <Btn
                            blue
                            onClick={regenerateCurrent}
                            loading={aiLoading}
                            disabled={!currentDisplay.requirement?.trim()}
                        >
                          Regenerate
                        </Btn>
                      </div>
                    </div>

                    <textarea
                        value={aiInstruction}
                        onChange={(e) => setAiInstruction(e.target.value)}
                        placeholder="Example: Add more negative cases, remove duplicates, improve coverage."
                        style={{
                          width: "95%",
                          minHeight: 84,
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 10,
                          padding: "12px 14px",
                          fontSize: 13,
                          resize: "vertical",
                        }}
                    />

                    {error && (
                        <div style={{ marginTop: 10, color: "#991b1b", fontSize: 12 }}>
                          {error}
                        </div>
                    )}
                  </div>

                  {currentDisplay.testCases.map((tc, i) => (
                      <TestCaseCard
                          key={`${tc.id}-${i}`}
                          tc={tc}
                          onEdit={async (updated) => {
                            if (page === "detail" && detailEntry) {
                              const updatedCases = [...detailEntry.testCases];
                              updatedCases[i] = updated;

                              const updatedEntry = {
                                ...detailEntry,
                                testCases: updatedCases,
                                updatedAt: Date.now(),
                              };

                              setDetailEntry(updatedEntry);
                              await updateSession(detailEntry.id, updatedEntry);
                              await loadSavedFromBackend();
                            } else if (result) {
                              const updatedCases = [...result.testCases];
                              updatedCases[i] = updated;
                              setResult({ ...result, testCases: updatedCases });
                            }
                          }}
                          onDelete={async (id) => {
                            if (page === "detail" && detailEntry) {
                              const updatedCases = detailEntry.testCases.filter(
                                  (item) => item.id !== id
                              );

                              const updatedEntry = {
                                ...detailEntry,
                                testCases: updatedCases,
                                updatedAt: Date.now(),
                              };

                              setDetailEntry(updatedEntry);
                              await updateSession(detailEntry.id, updatedEntry);
                              await loadSavedFromBackend();
                            } else if (result) {
                              const updatedCases = result.testCases.filter(
                                  (item) => item.id !== id
                              );
                              setResult({ ...result, testCases: updatedCases });
                            }
                          }}
                      />
                  ))}
                </div>
            )}

            {page === "log-detail" && detailEntry && (
                <div style={{ maxWidth: 860 }}>
                  <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 20,
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                  >
                    <div>
                      <h2
                          style={{
                            fontSize: 22,
                            fontWeight: 800,
                            color: "#111827",
                            margin: "0 0 4px",
                          }}
                      >
                        {detailEntry.title}
                      </h2>

                      <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                        Saved log analysis session
                      </p>
                    </div>

                    <Btn
                        secondary
                        onClick={() => {
                          setPage("saved");
                          setDetailEntry(null);
                        }}
                    >
                      ← Saved
                    </Btn>
                  </div>

                  <div className="panel-card" style={{ padding: 16, marginBottom: 18 }}>
                    <div className="section-label" style={{ marginBottom: 10 }}>
                      ORIGINAL LOGS
                    </div>

                    <pre
                        style={{
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          fontSize: 13,
                          lineHeight: 1.7,
                          color: "#374151",
                        }}
                    >
                  {detailEntry.logs || "No raw logs stored."}
                </pre>
                  </div>

                  {!!(detailEntry.attachments || []).length && (
                      <div className="panel-card" style={{ padding: 16, marginBottom: 18 }}>
                        <div className="section-label" style={{ marginBottom: 10 }}>
                          ATTACHMENTS
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {(detailEntry.attachments || []).map((file) => (
                              <div
                                  key={file.id}
                                  style={{
                                    background: "#f8fafc",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    fontSize: 13,
                                  }}
                              >
                                {file.name}
                              </div>
                          ))}
                        </div>
                      </div>
                  )}

                  {detailEntry.logAnalysis && (
                      <div className="panel-card" style={{ padding: 18 }}>
                        <div className="section-label" style={{ marginBottom: 14 }}>
                          ANALYSIS RESULT
                        </div>

                        <div style={{ display: "grid", gap: 14 }}>
                          <ResultSection
                              title="Summary"
                              content={detailEntry.logAnalysis.summary}
                          />
                          <ResultSection
                              title="Errors Found"
                              content={detailEntry.logAnalysis.errorsFound}
                          />
                          <ResultSection
                              title="Warnings Found"
                              content={detailEntry.logAnalysis.warningsFound}
                          />
                          <ResultSection
                              title="Probable Root Cause"
                              content={detailEntry.logAnalysis.probableRootCause}
                          />
                          <ResultSection
                              title="Affected Component / Module"
                              content={detailEntry.logAnalysis.affectedComponent}
                          />
                          <ResultSection
                              title="Suggested Next Checks"
                              content={detailEntry.logAnalysis.suggestedNextSteps}
                          />
                        </div>
                      </div>
                  )}
                </div>
            )}

            {page === "saved" && (
                <div style={{ maxWidth: 860 }}>
                  <div
                      style={{
                        marginBottom: 24,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                  >
                    <div>
                      <h2
                          style={{
                            fontSize: 22,
                            fontWeight: 800,
                            color: "#111827",
                            margin: "0 0 4px",
                          }}
                      >
                        {activeProjectName
                            ? `${activeProjectName} — Saved`
                            : "All Saved Results"}
                      </h2>
                    </div>

                    <Btn
                        onClick={() => {
                          resetWorkingSession();
                          setPage(activeProjectId ? "project-dashboard" : "selector");
                        }}
                    >
                      + New
                    </Btn>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {filteredSaved.map((entry) => (
                        <div
                            key={entry.id}
                            className="panel-card"
                            style={{
                              padding: "14px 16px",
                              display: "flex",
                              gap: 12,
                            }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: "#111827",
                                }}
                            >
                              {entry.title}
                            </div>

                            <div style={{ fontSize: 11, color: "#9ca3af" }}>
                              {entry.type === "log-analysis"
                                  ? `Log analysis · ${(entry.attachments || []).length} attachments`
                                  : `${(entry.testCases || []).length} cases · ${(entry.attachments || []).length} attachments`}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 6 }}>
                            {entry.type !== "log-analysis" && (
                                <Btn
                                    small
                                    onClick={() =>
                                        exportToExcel(entry, activeProjectName || "")
                                    }
                                >
                                  Excel
                                </Btn>
                            )}

                            <Btn
                                small
                                onClick={() => {
                                  setDetailEntry(entry);
                                  setResult(null);
                                  setPage(
                                      entry.type === "log-analysis"
                                          ? "log-detail"
                                          : "detail"
                                  );
                                }}
                            >
                              View
                            </Btn>

                            <Btn
                                small
                                danger
                                onClick={() => setDeleteModal(entry.id)}
                            >
                              Delete
                            </Btn>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            )}

            {page === "recycle" && (
                <div style={{ maxWidth: 860 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>
                    Recycle Bin
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {recycleBinEntries.map((entry) => (
                        <div
                            key={entry.id}
                            className="panel-card"
                            style={{
                              padding: "14px 16px",
                              display: "flex",
                              gap: 12,
                            }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>
                              {entry.title}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 6 }}>
                            <Btn
                                small
                                secondary
                                onClick={() => handleRestoreSession(entry.id)}
                            >
                              Restore
                            </Btn>

                            <Btn
                                small
                                danger
                                onClick={() =>
                                    handleDeleteSessionPermanently(entry.id)
                                }
                            >
                              Delete Permanently
                            </Btn>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            )}
          </main>
        </div>

        {saveModal && (
            <Modal title="Save Test Cases" onClose={() => setSaveModal(false)}>
              <input
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Session title"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 14,
                    marginBottom: 16,
                  }}
              />

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Btn secondary onClick={() => setSaveModal(false)}>
                  Cancel
                </Btn>

                <Btn onClick={executeSave} disabled={!saveTitle.trim()}>
                  Save →
                </Btn>
              </div>
            </Modal>
        )}

        {logSaveModal && (
            <Modal title="Save Log Analysis" onClose={() => setLogSaveModal(false)}>
              <input
                  value={logSaveTitle}
                  onChange={(e) => setLogSaveTitle(e.target.value)}
                  placeholder="Analysis title"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 14,
                    marginBottom: 16,
                  }}
              />

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Btn secondary onClick={() => setLogSaveModal(false)}>
                  Cancel
                </Btn>

                <Btn onClick={executeLogSave} disabled={!logSaveTitle.trim()}>
                  Save →
                </Btn>
              </div>
            </Modal>
        )}

        {deleteModal && (
            <Modal title="Move to Recycle Bin?" onClose={() => setDeleteModal(null)}>
              <p style={{ fontSize: 13, color: "#6b7280" }}>
                This session will be moved to the recycle bin first.
              </p>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Btn secondary onClick={() => setDeleteModal(null)}>
                  Cancel
                </Btn>

                <Btn danger onClick={() => handleMoveToRecycleBin(deleteModal)}>
                  Move to Recycle Bin
                </Btn>
              </div>
            </Modal>
        )}

        {manualModalOpen && (
            <Modal
                title="Add Manual Test Case"
                onClose={() => setManualModalOpen(false)}
                wide
            >
              <EditField
                  label="Title"
                  value={manualDraft.title}
                  onChange={(v) => setManualDraft({ ...manualDraft, title: v })}
              />

              <EditField
                  label="Feature"
                  value={manualDraft.feature || "General"}
                  onChange={(v) => setManualDraft({ ...manualDraft, feature: v })}
              />

              <EditField
                  label="Test Type"
                  value={manualDraft.testType}
                  onChange={(v) => setManualDraft({ ...manualDraft, testType: v })}
                  select={["Positive", "Negative", "Boundary", "Edge"]}
              />

              <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                  }}
              >
                <EditField
                    label="Priority"
                    value={manualDraft.priority || "Medium"}
                    onChange={(v) => setManualDraft({ ...manualDraft, priority: v })}
                    select={["Low", "Medium", "High", "Critical"]}
                />

                <EditField
                    label="Severity"
                    value={manualDraft.severity || "Medium"}
                    onChange={(v) => setManualDraft({ ...manualDraft, severity: v })}
                    select={["Low", "Medium", "High", "Critical"]}
                />

                <EditField
                    label="Automation Candidate"
                    value={manualDraft.automationCandidate || "Maybe"}
                    onChange={(v) =>
                        setManualDraft({ ...manualDraft, automationCandidate: v })
                    }
                    select={["Yes", "No", "Maybe"]}
                />
              </div>

              <EditField
                  label="Preconditions"
                  value={manualDraft.preconditions}
                  onChange={(v) =>
                      setManualDraft({ ...manualDraft, preconditions: v })
                  }
                  multiline
              />

              <EditField
                  label="Expected Result"
                  value={manualDraft.expectedResult}
                  onChange={(v) =>
                      setManualDraft({ ...manualDraft, expectedResult: v })
                  }
                  multiline
              />

              <EditField
                  label="Actual Result"
                  value={manualDraft.actualResult || ""}
                  onChange={(v) =>
                      setManualDraft({ ...manualDraft, actualResult: v })
                  }
                  multiline
              />

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Btn secondary onClick={() => setManualModalOpen(false)}>
                  Cancel
                </Btn>

                <Btn onClick={saveManualTestCase}>Save Manual Test Case</Btn>
              </div>
            </Modal>
        )}
      </>
  );
}