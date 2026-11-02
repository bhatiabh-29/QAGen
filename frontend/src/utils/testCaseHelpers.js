// --------------------------------------------------
// Test case helper utilities
// These functions keep test-case-related data clean
// and consistent across the app.
// --------------------------------------------------

/**
 * Normalize a single test case object so the UI
 * always gets a predictable shape.
 */
export function normalizeTestCase(tc, fallbackIndex = 0, source = "AI") {
    return {
        id: tc.id || `TC-${String(fallbackIndex + 1).padStart(3, "0")}`,
        title:
            tc.title ||
            tc.expectedResult ||
            (Array.isArray(tc.steps) && tc.steps[0]) ||
            `Test Case ${fallbackIndex + 1}`,
        feature: tc.feature || "General",
        preconditions: tc.preconditions || "",
        steps: Array.isArray(tc.steps) ? tc.steps : [],
        expectedResult: tc.expectedResult || "",
        testType: tc.testType || "Positive",
        source: tc.source || source,
        status: tc.status || "Untested",
        priority: tc.priority || "Medium",
        severity: tc.severity || "Medium",
        automationCandidate: ["Yes", "No", "Maybe"].includes(tc.automationCandidate)
            ? tc.automationCandidate
            : "Maybe",
        actualResult: tc.actualResult || "",
        executedBy: tc.executedBy || "",
        executedDate: tc.executedDate || "",
        executionNotes: tc.executionNotes || "",
        evidence: Array.isArray(tc.evidence) ? tc.evidence : [],
        executedAt: tc.executedAt || null,
    };
}

/**
 * Normalize an array of test cases.
 */
export function normalizeTestCases(testCases = [], source = "AI") {
    return testCases.map((tc, i) => normalizeTestCase(tc, i, source));
}

/**
 * Default empty manual test case draft used in the modal.
 */
export function defaultManualDraft() {
    return {
        id: "",
        title: "",
        feature: "General",
        preconditions: "",
        steps: [""],
        expectedResult: "",
        testType: "Positive",
        source: "Manual",
        status: "Untested",
        priority: "Medium",
        severity: "Medium",
        automationCandidate: "Maybe",
        actualResult: "",
        executedBy: "",
        executedDate: "",
        executionNotes: "",
        evidence: [],
        executedAt: null,
    };
}