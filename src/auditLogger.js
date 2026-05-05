import fs from "fs";

const LOG_FILE = "audit.log";

//  Main logger
export function logDecision(event, actions) {
  const logEntry = buildLogEntry(event, actions);

  console.log("📜 AUDIT LOG");
  console.log(logEntry);

  persistLog(logEntry);
}

//  Build structured log
function buildLogEntry(event, actions) {
  return {
    id: generateLogId(), //  unique log id (important)

    event: "pull_request.opened",

    repository: {
      name: event.repository?.full_name || "unknown-repo",
    },

    actor: {
      username: event.pull_request?.user?.login || "unknown-user",
      association: event.pull_request?.author_association || "unknown",
    },

    context: {
      pr_number: event.pull_request?.number ?? "N/A", //  better fallback
      has_assignees: (event.pull_request?.assignees?.length || 0) > 0,
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

//  Better reasoning (this is a key improvement)
function deriveReason(actions) {
  if (!actions || actions.length === 0) {
    return "no rules matched";
  }

  return `matched rules: ${actions.join(", ")}`;
}

//  Generate unique log id
function generateLogId() {
  return `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

//  Persist log
function persistLog(logEntry) {
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + "\n");
  } catch (error) {
    console.error("❌ Failed to write audit log:", error.message);
  }
}