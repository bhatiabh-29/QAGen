import express from "express";
import pdf from "pdf-parse/lib/pdf-parse.js";

const router = express.Router();

/* -----------------------------
   PDF HELPERS
----------------------------- */
function stripDataUrlPrefix(dataUrl) {
    const idx = dataUrl.indexOf(",");
    return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
}

async function extractPdfText(dataUrl) {
    const buffer = Buffer.from(stripDataUrlPrefix(dataUrl), "base64");
    const parsed = await pdf(buffer);
    return parsed.text || "";
}

function truncateText(text, max = 12000) {
    if (!text) return "";
    return text.length > max
        ? text.slice(0, max) + "\n\n[PDF content truncated]"
        : text;
}

/* -----------------------------
   POST /api/generate-test-cases
   generate AI test cases from text/images/PDFs
----------------------------- */
router.post("/generate-test-cases", async (req, res) => {
    try {
        const { requirement, attachments = [], systemPrompt } = req.body || {};

        if ((!requirement || !String(requirement).trim()) && attachments.length === 0) {
            return res.status(400).json({ error: "Requirement or attachments are required." });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server." });
        }

        const contentParts = [];

        for (const file of attachments) {
            if (!file?.type || !file?.dataUrl) continue;

            if (file.type === "application/pdf") {
                try {
                    const pdfText = await extractPdfText(file.dataUrl);
                    contentParts.push({
                        type: "text",
                        text: `[Attached PDF: ${file.name}]\n\nExtracted PDF content:\n${truncateText(pdfText)}`,
                    });
                } catch (err) {
                    contentParts.push({
                        type: "text",
                        text: `[Attached PDF: ${file.name}]\n\nPDF parsing failed: ${err.message}`,
                    });
                }
            } else if (String(file.type).startsWith("image/")) {
                contentParts.push({
                    type: "image_url",
                    image_url: { url: file.dataUrl },
                });
            }
        }

        if (requirement && String(requirement).trim()) {
            contentParts.push({ type: "text", text: `Requirement:\n${requirement}` });
        }

        const hasImage = attachments.some((f) => String(f?.type || "").startsWith("image/"));
        const model = hasImage
            ? process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct"
            : process.env.GROQ_TEXT_MODEL || "llama-3.3-70b-versatile";

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model,
                temperature: 0.3,
                max_tokens: 4000,
                messages: [
                    { role: "system", content: systemPrompt || "Generate QA test cases in JSON." },
                    { role: "user", content: contentParts },
                ],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data?.error?.message || "Groq request failed",
                details: data,
            });
        }

        const content = data?.choices?.[0]?.message?.content || "";
        res.json({ content, model, usage: data?.usage || null });
    } catch (err) {
        console.error("AI generation error:", err);
        res.status(500).json({ error: err.message || "Unexpected server error" });
    }
});

export default router;