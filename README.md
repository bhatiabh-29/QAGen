# QAgen

**AI-assisted test case generation and application log analysis for QA engineers.**

QAgen is a full-stack QA workspace that turns written requirements, supporting PDFs, and screenshots into structured, reviewable test cases. It also supports AI-assisted log analysis, project organization, saved sessions, and export workflows.

> **Status:** Active portfolio project. AI-generated results are suggestions and should be reviewed before use in production testing.

## Features

- **AI-assisted test case generation:** Create test cases with titles, preconditions, steps, expected results, test type, priority, severity, and automation candidacy.
- **Multimodal requirements:** Add requirement text and attach PDFs or images for additional context.
- **Log analysis:** Analyze application logs to identify errors, warnings, potential root causes, and recommended next checks.
- **Project organization:** Create projects and nested folders to group testing work.
- **Saved sessions:** Save and revisit test case generation and log analysis work.
- **Manual review:** Edit generated cases and add manual test cases.
- **Export:** Export test cases to Excel-compatible files for execution and reporting.
- **Local persistence:** Store project and session data in SQLite.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express |
| Database | SQLite (`sqlite3`) |
| AI integration | Groq API |
| Document processing | `pdf-parse` |
| Export | Excel-compatible output |

## How It Works

1. Create a project or open an existing one.
2. Enter a feature requirement or acceptance criteria.
3. Optionally attach a PDF or screenshot.
4. Generate structured test cases with AI.
5. Review, edit, or supplement the results with manual test cases.
6. Save the session under the relevant project.
7. Export the test cases for further review or execution.

For troubleshooting, use the **Log Analysis** workflow to submit logs and review AI-generated findings.

## Screenshots

Add screenshots to `docs/screenshots/` and uncomment the references below:

<!-- ![QAgen project dashboard](docs/screenshots/dashboard.png) -->
<!-- ![Generated test cases](docs/screenshots/test-cases.png) -->
<!-- ![Log analysis](docs/screenshots/log-analysis.png) -->

## Project Structure

```text
QAGen/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── db/
│       │   └── connection.js
│       └── modules/
│           ├── generation/generationRoutes.js
│           ├── logs/logRoutes.js
│           ├── projects/projectRoutes.js
│           └── sessions/sessionRoutes.js
├── frontend/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── api/
│       ├── components/
│       ├── styles/
│       └── utils/
├── .gitignore
└── README.md
```

> `backend/qagen.db` is generated locally and should not be committed. Component and utility files may evolve as the application is refactored.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- A [Groq API key](https://console.groq.com/keys)

### 1. Clone the repository

```bash
git clone https://github.com/bhatiabh-29/QAGen.git
cd QAGen
```

### 2. Install and configure the backend

```bash
cd backend
npm install
```

Create `backend/.env` (or copy `backend/.env.example` and update it):

```dotenv
PORT=3001
GROQ_API_KEY=your_new_groq_api_key_here
GROQ_TEXT_MODEL=openai/gpt-oss-20b
GROQ_VISION_MODEL=your_supported_groq_vision_model_id
FRONTEND_ORIGIN=http://localhost:5173
```

Choose a currently available vision model from the [Groq model list](https://console.groq.com/docs/models) if you plan to upload images. Model availability changes; check the documentation before configuring model IDs. The backend must use the corresponding environment variables for these settings to take effect.

Start the backend:

```bash
npm run dev
```

Default backend URL: `http://localhost:3001`

### 3. Install and configure the frontend

Open a **second terminal** from the project root:

```bash
cd frontend
npm install
```

Create `frontend/.env` if required by your frontend configuration:

```dotenv
VITE_API_BASE_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

Default frontend URL: `http://localhost:5173`

> If your frontend uses a different Vite environment variable or a proxy, follow the configuration in `frontend/src` and `frontend/vite.config.js`.

## API Overview

The Express backend mounts these route groups:

| Base path | Purpose |
| --- | --- |
| `GET /api/health` | Health check |
| `/api/projects` | Project and folder management |
| `/api/sessions` | Save, retrieve, update, trash, restore, and delete sessions |
| `/api/generate-test-cases` | AI-assisted test case generation |
| `/api/logs` | Log analysis operations |

The precise methods and subroutes are defined in the corresponding `*Routes.js` files.

## Example Test Case

```json
{
  "id": "TC-001",
  "title": "User can log in with valid credentials",
  "feature": "Authentication",
  "preconditions": "User has an active account",
  "steps": [
    "Open the login page",
    "Enter a valid email and password",
    "Select Log in"
  ],
  "expectedResult": "The user is redirected to the dashboard.",
  "testType": "Positive",
  "priority": "High",
  "severity": "High",
  "automationCandidate": "Yes"
}
```

## Security and Data Handling

- **Never commit `backend/.env`, API keys, or local database files.** The repository's `.gitignore` should exclude them.
- Commit example environment files containing placeholders only.
- Requirement text, extracted PDF content, images, and submitted logs may be sent to the configured AI provider for processing. Avoid submitting confidential or personal information without authorization.
- Review AI-generated test cases and log findings for accuracy, completeness, and false positives.

## Production Build

```bash
cd frontend
npm run build
npm run preview
```

The preview command serves the frontend build locally; production deployment also requires a hosted backend, environment configuration, and an appropriate persistence strategy.

## Roadmap

- Authentication and role-based access
- Multi-user collaboration
- Stronger AI response validation and prompt versioning
- Expanded log-analysis exports and reporting
- Test coverage and session analytics
- Automated tests and CI workflows
- Cloud deployment configuration

## Contributing

Feedback, issues, and pull requests are welcome. When reporting a bug, include reproduction steps, expected behavior, actual behavior, and relevant non-sensitive logs.

## License

No license has been declared for this repository. All rights are reserved unless a license file is added.

---

**QAgen — Turning requirements and application logs into actionable QA insights.**
