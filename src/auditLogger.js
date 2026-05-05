import fs from "fs";

const LOG_FILE = "audit.log"; // later: replace with DB or external logging system

export function logDecision(event, actions) {
  const logEntry = buildLogEntry(event, actions);

  // 🖥️ Console output (developer visibility)
  console.log("📜 AUDIT LOG");
  console.log(logEntry);

  // 💾 Persist to file (production habit)
  persistLog(logEntry);
}

// 🧠 Build structured log object
function buildLogEntry(event, actions) {
  return {
    event: "pull_request.opened",

    repository: {
      name: event.repository?.full_name || "unknown-repo",
    },

    actor: {
      username: event.pull_request?.user?.login || "unknown-user",
      association: event.pull_request?.author_association || "unknown",
    },

    context: {
      pr_number: event.pull_request?.number || null,
      has_assignees: event.pull_request?.assignees?.length > 0,
    },

    decision: {
      actions,
      reason: deriveReason(actions),
    },

    metadata: {
      timestamp: new Date().toISOString(),
      source: "hiero-workflow-app",
      mode: process.env.DRY_RUN === "true" ? "dry-run" : "live",
    },
  };
}

// 🧠 Explain WHY decisions happened (very important signal)
function deriveReason(actions) {
  if (!actions || actions.length === 0) {
    return "no rules matched";
  }

  return "matched configured rules";
}

// 💾 Persist logs (simple file append)
function persistLog(logEntry) {
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + "\n");
  } catch (error) {
    console.error("❌ Failed to write audit log:", error.message);
  }
}