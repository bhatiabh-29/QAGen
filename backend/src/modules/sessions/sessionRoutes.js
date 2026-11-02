import express from "express";
import { all, get, run } from "../../db/connection.js";

const router = express.Router();

// --------------------------------------------------
// Safely parse JSON columns from SQLite
// --------------------------------------------------
function safeParseJson(value, fallback) {
    try {
        return JSON.parse(value || JSON.stringify(fallback));
    } catch {
        return fallback;
    }
}

// --------------------------------------------------
// Normalize one DB row into API response shape
// This now supports both:
// - test-cases sessions
// - log-analysis sessions
// --------------------------------------------------
function mapSessionRow(row) {
    return {
        ...row,
        type: row.type || "test-cases",
        attachments: safeParseJson(row.attachments, []),
        testCases: safeParseJson(row.testCases, []),
        logAnalysis: safeParseJson(row.logAnalysis, null),
        logs: row.logs || "",
        requirement: row.requirement || "",
    };
}

/* -----------------------------
   GET /api/sessions
   returns all saved sessions
----------------------------- */
router.get("/", async (_req, res) => {
    try {
        const rows = await all(`SELECT * FROM sessions ORDER BY createdAt DESC`);
        const parsed = rows.map(mapSessionRow);
        res.json(parsed);
    } catch (err) {
        console.error("Error loading sessions:", err);
        res.status(500).json({ error: err.message || "Failed to load sessions." });
    }
});

/* -----------------------------
   GET /api/sessions/:id
   returns one saved session
----------------------------- */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const row = await get(`SELECT * FROM sessions WHERE id = ?`, [id]);

        if (!row) {
            return res.status(404).json({ error: "Session not found." });
        }

        res.json(mapSessionRow(row));
    } catch (err) {
        console.error("Error loading session:", err);
        res.status(500).json({ error: err.message || "Failed to load session." });
    }
});

/* -----------------------------
   POST /api/sessions
   create/save a new session
----------------------------- */
router.post("/", async (req, res) => {
    try {
        const {
            title,
            type = "test-cases",
            requirement = "",
            logs = "",
            attachments = [],
            testCases = [],
            logAnalysis = null,
            projectId,
        } = req.body || {};

        if (!title || !projectId) {
            return res.status(400).json({ error: "title and projectId are required" });
        }

        const id = Date.now().toString();
        const now = Date.now();

        await run(
            `
                INSERT INTO sessions (
                    id,
                    title,
                    type,
                    requirement,
                    logs,
                    attachments,
                    testCases,
                    logAnalysis,
                    projectId,
                    createdAt,
                    updatedAt,
                    deletedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                id,
                title,
                type,
                requirement || "",
                logs || "",
                JSON.stringify(attachments || []),
                JSON.stringify(testCases || []),
                JSON.stringify(logAnalysis || null),
                projectId,
                now,
                now,
                null,
            ]
        );

        res.json({ ok: true, id });
    } catch (err) {
        console.error("Error saving session:", err);
        res.status(500).json({ error: err.message || "Failed to save session." });
    }
});

/* -----------------------------
   PUT /api/sessions/:id
   update one saved session
----------------------------- */
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title = "",
            type = "test-cases",
            requirement = "",
            logs = "",
            attachments = [],
            testCases = [],
            logAnalysis = null,
            projectId = null,
            deletedAt = null,
        } = req.body || {};

        const existing = await get(`SELECT * FROM sessions WHERE id = ?`, [id]);

        if (!existing) {
            return res.status(404).json({ error: "Session not found." });
        }

        await run(
            `
                UPDATE sessions
                SET
                    title = ?,
                    type = ?,
                    requirement = ?,
                    logs = ?,
                    attachments = ?,
                    testCases = ?,
                    logAnalysis = ?,
                    projectId = ?,
                    createdAt = ?,
                    updatedAt = ?,
                    deletedAt = ?
                WHERE id = ?
            `,
            [
                title || "",
                type || "test-cases",
                requirement || "",
                logs || "",
                JSON.stringify(attachments || []),
                JSON.stringify(testCases || []),
                JSON.stringify(logAnalysis || null),
                projectId,
                existing.createdAt,
                Date.now(),
                deletedAt,
                id,
            ]
        );

        res.json({ ok: true });
    } catch (err) {
        console.error("Error updating session:", err);
        res.status(500).json({ error: err.message || "Failed to update session." });
    }
});

/* -----------------------------
   POST /api/sessions/:id/trash
   soft delete one session
----------------------------- */
router.post("/:id/trash", async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await get(`SELECT * FROM sessions WHERE id = ?`, [id]);

        if (!existing) {
            return res.status(404).json({ error: "Session not found." });
        }

        await run(
            `
                UPDATE sessions
                SET deletedAt = ?, updatedAt = ?
                WHERE id = ?
            `,
            [Date.now(), Date.now(), id]
        );

        res.json({ ok: true, id });
    } catch (err) {
        console.error("Error moving session to trash:", err);
        res.status(500).json({ error: err.message || "Failed to move session to trash." });
    }
});

/* -----------------------------
   POST /api/sessions/:id/restore
   restore one trashed session
----------------------------- */
router.post("/:id/restore", async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await get(`SELECT * FROM sessions WHERE id = ?`, [id]);

        if (!existing) {
            return res.status(404).json({ error: "Session not found." });
        }

        await run(
            `
                UPDATE sessions
                SET deletedAt = NULL, updatedAt = ?
                WHERE id = ?
            `,
            [Date.now(), id]
        );

        res.json({ ok: true, id });
    } catch (err) {
        console.error("Error restoring session:", err);
        res.status(500).json({ error: err.message || "Failed to restore session." });
    }
});

/* -----------------------------
   DELETE /api/sessions/:id
   permanently delete one session
----------------------------- */
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await get(`SELECT * FROM sessions WHERE id = ?`, [id]);

        if (!existing) {
            return res.status(404).json({ error: "Session not found." });
        }

        await run(`DELETE FROM sessions WHERE id = ?`, [id]);
        res.json({ ok: true, id });
    } catch (err) {
        console.error("Error deleting session:", err);
        res.status(500).json({ error: err.message || "Failed to delete session." });
    }
});

export default router;