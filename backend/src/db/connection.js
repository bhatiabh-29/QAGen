import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// --------------------------------------------------
// Resolve database file path
// --------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "..", "qagen.db");

let db = null;

// --------------------------------------------------
// Helpers
// --------------------------------------------------
export function getDbPath() {
    return dbPath;
}

export function getDb() {
    if (!db) {
        throw new Error("Database not initialized. Call initDb() first.");
    }
    return db;
}

export function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        getDb().run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

export function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        getDb().get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

export function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        getDb().all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// --------------------------------------------------
// Add missing columns safely for older databases
// This allows your existing qagen.db file to evolve
// without deleting it.
// --------------------------------------------------
async function ensureColumn(tableName, columnName, columnTypeSql) {
    const columns = await all(`PRAGMA table_info(${tableName})`);
    const exists = columns.some((col) => col.name === columnName);

    if (!exists) {
        await run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnTypeSql}`);
    }
}

// --------------------------------------------------
// DB initialization
// Creates tables if missing, then applies lightweight
// schema migrations for newly introduced columns.
// --------------------------------------------------
export async function initDb() {
    if (db) return;

    db = new sqlite3.Database(dbPath);

    // -----------------------------
    // Projects table
    // -----------------------------
    await run(`
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            parentId TEXT,
            createdAt INTEGER
        )
    `);

    // -----------------------------
    // Sessions table
    // Supports:
    // - test case sessions
    // - log analysis sessions
    // -----------------------------
    await run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            type TEXT,
            requirement TEXT,
            logs TEXT,
            attachments TEXT,
            testCases TEXT,
            logAnalysis TEXT,
            projectId TEXT,
            createdAt INTEGER,
            updatedAt INTEGER,
            deletedAt INTEGER
        )
    `);

    // -----------------------------
    // Migrations for existing DBs
    // If user already has qagen.db created with older
    // schema, these columns will be added safely.
    // -----------------------------
    await ensureColumn("sessions", "type", "TEXT");
    await ensureColumn("sessions", "logs", "TEXT");
    await ensureColumn("sessions", "logAnalysis", "TEXT");
}