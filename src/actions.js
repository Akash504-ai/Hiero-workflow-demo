/**
 * actions.js
 *
 * This module is responsible for executing actions determined by the rule engine.
 * It acts as the "execution layer" of the system, taking decisions (e.g., comment on PR,
 * assign reviewer) and performing them using the GitHub API.
 *
 * Key Responsibilities:
 * - Normalize incoming event data into a consistent context object
 * - Route actions to appropriate handlers
 * - Execute actions via GitHub API (or simulate in dry-run mode)
 * - Enforce safety constraints (e.g., prevent assigning PR author as reviewer)
 * - Handle errors gracefully to ensure system reliability
 *
 * Supported Actions:
 * - comment_welcome → posts a welcome comment on pull requests
 * - assign_default_reviewer → assigns a reviewer to the pull request
 *
 * Modes:
 * - DRY_RUN=true  → simulate actions (no API calls)
 * - DRY_RUN=false → execute real GitHub API actions
 */

import dotenv from "dotenv";
import { Octokit } from "@octokit/rest";

dotenv.config();

const DRY_RUN = process.env.DRY_RUN === "true";

// GitHub API client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * Main entry point for executing actions
 * @param {string[]} actions - List of actions from rule engine
 * @param {object} event - GitHub webhook event payload
 */
export async function executeActions(actions, event) {
  const context = buildContext(event);

  for (const action of actions) {
    try {
      await dispatchAction(action, context);
    } catch (error) {
      console.error(`❌ Failed action: ${action}`, error.message);
    }
  }
}

/**
 * Builds a normalized context object from raw GitHub event
 * This ensures consistency across all actions
 */
function buildContext(event) {
  const fullName = event.repository?.full_name || "";
  const [owner, repo] = fullName.split("/");

  return {
    owner,
    repo,
    prNumber: event.pull_request?.number,
    author: event.pull_request?.user?.login || "unknown-user",
  };
}

/**
 * Routes actions to their respective handlers
 */
async function dispatchAction(action, context) {
  switch (action) {
    case "comment_welcome":
      return commentWelcome(context);

    case "assign_default_reviewer":
      return assignDefaultReviewer(context);

    default:
      console.warn(`⚠️ Unknown action: ${action}`);
  }
}

/**
 * Action: Post welcome comment on pull request
 */
async function commentWelcome(context) {
  const message = `👋 Welcome @${context.author}! Thanks for your contribution.`;

  if (DRY_RUN) {
    console.log(
      `🧪 [DRY RUN] Comment on PR #${context.prNumber}: "${message}"`
    );
    return;
  }

  console.log(`🚀 Posting comment on PR #${context.prNumber}`);

  await octokit.issues.createComment({
    owner: context.owner,
    repo: context.repo,
    issue_number: context.prNumber,
    body: message,
  });
}

/**
 * Action: Assign reviewer to pull request
 */
async function assignDefaultReviewer(context) {
  const reviewer = context.owner;

  // Safety check: prevent assigning PR author as reviewer
  if (reviewer === context.author) {
    console.log(
      "⚠️ Skipping reviewer assignment (author cannot review their own PR)"
    );
    return;
  }

  if (DRY_RUN) {
    console.log(
      `🧪 [DRY RUN] Assign reviewer "${reviewer}" to PR #${context.prNumber}`
    );
    return;
  }

  console.log(`🚀 Assigning reviewer "${reviewer}" to PR #${context.prNumber}`);

  await octokit.pulls.requestReviewers({
    owner: context.owner,
    repo: context.repo,
    pull_number: context.prNumber,
    reviewers: [reviewer],
  });
}