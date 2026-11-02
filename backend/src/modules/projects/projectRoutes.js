import express from "express";
import { all, run } from "../../db/connection.js";

const router = express.Router();

/* -----------------------------
   GET /api/projects
   returns all projects as a nested tree
----------------------------- */
router.get("/", async (_req, res) => {
    try {
        const rows = await all(
            `SELECT id, name, parentId, createdAt FROM projects ORDER BY createdAt ASC`
        );

        function buildTree(items, parentId = null) {
            return items
                .filter((item) => item.parentId === parentId)
                .map((item) => ({
                    ...item,
                    children: buildTree(items, item.id),
                }));
        }

        res.json(buildTree(rows));
    } catch (err) {
        console.error("Failed to load projects:", err);
        res.status(500).json({ error: err.message || "Failed to load projects." });
    }
});

/* -----------------------------
   POST /api/projects
   create a new project or subproject
----------------------------- */
router.post("/", async (req, res) => {
    try {
        const {
            id,
            name,
            parentId = null,
            createdAt = Date.now(),
        } = req.body || {};

        if (!id || !name) {
            return res.status(400).json({ error: "id and name are required." });
        }

        await run(
            `
        INSERT INTO projects (id, name, parentId, createdAt)
        VALUES (?, ?, ?, ?)
      `,
            [id, name, parentId, createdAt]
        );

        res.json({ ok: true, id });
    } catch (err) {
        console.error("Failed to create project:", err);
        res.status(500).json({ error: err.message || "Failed to create project." });
    }
});

/* -----------------------------
   PUT /api/projects/:id
   rename one project
----------------------------- */
router.put("/:id", async (req, res) => {
    try {
        const { name } = req.body || {};
        const { id } = req.params;

        if (!name) {
            return res.status(400).json({ error: "name is required." });
        }

        await run(`UPDATE projects SET name = ? WHERE id = ?`, [name, id]);
        res.json({ ok: true });
    } catch (err) {
        console.error("Failed to rename project:", err);
        res.status(500).json({ error: err.message || "Failed to rename project." });
    }
});

/* -----------------------------
   DELETE /api/projects/:id
   delete one project and all descendants
   also unassign sessions from deleted projects
----------------------------- */
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const rows = await all(`SELECT id, parentId FROM projects`);

        function collectDescendantIds(projectId) {
            const children = rows.filter((r) => r.parentId === projectId);
            let ids = [projectId];
            for (const child of children) {
                ids = ids.concat(collectDescendantIds(child.id));
            }
            return ids;
        }

        const idsToDelete = collectDescendantIds(id);

        for (const pid of idsToDelete) {
            await run(`DELETE FROM projects WHERE id = ?`, [pid]);
        }

        for (const pid of idsToDelete) {
            await run(`UPDATE sessions SET projectId = NULL WHERE projectId = ?`, [pid]);
        }

        res.json({ ok: true, deletedIds: idsToDelete });
    } catch (err) {
        console.error("Failed to delete project:", err);
        res.status(500).json({ error: err.message || "Failed to delete project." });
    }
});

export default router;