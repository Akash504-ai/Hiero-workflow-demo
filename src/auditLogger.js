/**
 * auditLogger.js
 *
 * This module is responsible for capturing and persisting audit logs for all decisions made by the system. It provides transparency, traceability, and observability into how rules are evaluated and actions are executed.
 *
 * Key Responsibilities:
 * - Generate structured log entries for each event processed
 * - Capture metadata such as actor, repository, and decision context
 * - Provide reasoning for why specific actions were taken
 * - Persist logs to storage (currently file-based)
 * - Ensure unique identification for each log entry
 *
 * Why this matters:
 * - Enables debugging and system monitoring
 * - Provides accountability for automated actions
 * - Supports future analytics and observability tooling
 *
 * Current Storage:
 * - Local file (audit.log)
 *
 * Future Extensions:
 * - Database-backed logging (PostgreSQL / NoSQL)
 * - Centralized logging systems (ELK, Datadog, etc.)
 * - Real-time monitoring dashboards
 */

import fs from "fs";

const LOG_FILE = "audit.log";

/**
 * Main entry point for logging decisions
 * @param {object} event - GitHub webhook event
 * @param {string[]} actions - Actions decided by rule engine
 */
export function logDecision(event, actions) {
  const logEntry = buildLogEntry(event, actions);

  // Console output (developer visibility)
  console.log("📜 AUDIT LOG");
  console.log(logEntry);

  // Persist to file
  persistLog(logEntry);
}

/**
 * Builds a structured log object from event + decisions
 */
function buildLogEntry(event, actions) {
  return {
    id: generateLogId(), // unique identifier

    event: "pull_request.opened",

    repository: {
      name: event.repository?.full_name || "unknown-repo",
    },

    actor: {
      username: event.pull_request?.user?.login || "unknown-user",
      association: event.pull_request?.author_association || "unknown",
    },

    context: {
      pr_number: event.pull_request?.number ?? "N/A",
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

/**
 * Generates human-readable reasoning for decisions
 */
function deriveReason(actions) {
  if (!actions || actions.length === 0) {
    return "no rules matched";
  }

  return `matched rules: ${actions.join(", ")}`;
}

/**
 * Generates a unique log identifier
 */
function generateLogId() {
  return `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Persists log entry to file
 */
function persistLog(logEntry) {
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + "\n");
  } catch (error) {
    console.error("❌ Failed to write audit log:", error.message);
  }
}