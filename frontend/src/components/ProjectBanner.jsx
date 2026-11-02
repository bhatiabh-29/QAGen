import React from "react";

// --------------------------------------------------
// ProjectBanner
// Small reusable banner showing the currently active
// project context.
// --------------------------------------------------

export default function ProjectBanner({ projectName }) {
    if (!projectName) return null;

    return (
        <div className="project-banner">
            📁 {projectName} — scoped to this project
        </div>
    );
}