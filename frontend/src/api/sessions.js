const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

async function parseJson(res) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.error || "Request failed.");
    }
    return data;
}

export async function fetchSessions() {
    const res = await fetch(`${API_BASE}/api/sessions`);
    return parseJson(res);
}

export async function fetchSessionById(id) {
    const res = await fetch(`${API_BASE}/api/sessions/${id}`);
    return parseJson(res);
}

export async function createSession(entry) {
    const res = await fetch(`${API_BASE}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
    });
    return parseJson(res);
}

export async function updateSession(id, entry) {
    const res = await fetch(`${API_BASE}/api/sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
    });
    return parseJson(res);
}

export async function moveSessionToTrash(id) {
    const res = await fetch(`${API_BASE}/api/sessions/${id}/trash`, {
        method: "POST",
    });
    return parseJson(res);
}

export async function restoreSession(id) {
    const res = await fetch(`${API_BASE}/api/sessions/${id}/restore`, {
        method: "POST",
    });
    return parseJson(res);
}

export async function deleteSessionPermanently(id) {
    const res = await fetch(`${API_BASE}/api/sessions/${id}`, {
        method: "DELETE",
    });
    return parseJson(res);
}