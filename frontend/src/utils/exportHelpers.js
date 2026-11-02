import * as XLSX from "xlsx";

// --------------------------------------------------
// Excel export helper
// Keeps export logic outside App.jsx
// --------------------------------------------------

/**
 * Export test cases to Excel.
 * Used from saved sessions and results pages.
 */
export function exportToExcel(entry, projectName) {
    const wb = XLSX.utils.book_new();

    // -----------------------------
    // Summary worksheet
    // -----------------------------
    const summaryRows = [
        ["QA Test Case Export"],
        [],
        ["Title", entry.title || "Preview"],
        ["Project", projectName || "—"],
        ["Created", entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—"],
        ["Updated", entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : "—"],
        ["Requirement"],
        [entry.requirement || "—"],
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
    summaryWs["!cols"] = [{ wch: 18 }, { wch: 100 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // -----------------------------
    // Test case worksheet
    // -----------------------------
    const rows = [[
        "Test Case ID",
        "Title",
        "Feature",
        "Source",
        "Priority",
        "Severity",
        "Automation Candidate",
        "Status",
        "Test Type",
        "Preconditions",
        "Step No",
        "Test Step",
        "Expected Result",
        "Actual Result",
        "Executed By",
        "Executed Date",
        "Execution Notes",
        "Evidence Count",
    ]];

    (entry.testCases || []).forEach((tc) => {
        const steps = Array.isArray(tc.steps) && tc.steps.length ? tc.steps : [""];

        steps.forEach((step, idx) => {
            rows.push([
                idx === 0 ? tc.id : "",
                idx === 0 ? tc.title : "",
                idx === 0 ? (tc.feature || "General") : "",
                idx === 0 ? (tc.source || "AI") : "",
                idx === 0 ? (tc.priority || "Medium") : "",
                idx === 0 ? (tc.severity || "Medium") : "",
                idx === 0 ? (tc.automationCandidate || "Maybe") : "",
                idx === 0 ? (tc.status || "Untested") : "",
                idx === 0 ? (tc.testType || "Positive") : "",
                idx === 0 ? (tc.preconditions || "") : "",
                idx + 1,
                step,
                idx === 0 ? (tc.expectedResult || "") : "",
                idx === 0 ? (tc.actualResult || "") : "",
                idx === 0 ? (tc.executedBy || "") : "",
                idx === 0 ? (tc.executedDate || "") : "",
                idx === 0 ? (tc.executionNotes || "") : "",
                idx === 0 ? ((tc.evidence || []).length) : "",
            ]);
        });

        rows.push(["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws["!cols"] = [
        { wch: 14 },
        { wch: 32 },
        { wch: 20 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 18 },
        { wch: 12 },
        { wch: 12 },
        { wch: 28 },
        { wch: 10 },
        { wch: 42 },
        { wch: 34 },
        { wch: 34 },
        { wch: 18 },
        { wch: 18 },
        { wch: 30 },
        { wch: 14 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Test Cases");

    XLSX.writeFile(
        wb,
        `${(entry.title || "test_cases").replace(/[^a-z0-9]/gi, "_")}_export.xlsx`
    );
}