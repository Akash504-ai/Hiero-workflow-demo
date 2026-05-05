import dotenv from "dotenv";
import { Octokit } from "@octokit/rest";

dotenv.config();

const DRY_RUN = process.env.DRY_RUN === "true";

//  GitHub client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

//  Main executor
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

//  Build normalized context (clean + correct)
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

//  Action router
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

//  Comment action (REAL API)
async function commentWelcome(context) {
  const message = `👋 Welcome @${context.author}! Thanks for your contribution.`;

  if (DRY_RUN) {
    console.log(
      `🧪 [DRY RUN] Comment on PR #${context.prNumber}: "${message}"`,
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

//  Assign reviewer (REAL API)
async function assignDefaultReviewer(context) {
  const reviewer = context.owner;

  // ❗ Prevent assigning PR author as reviewer
  if (reviewer === context.author) {
    console.log(
      "⚠️ Skipping reviewer assignment (author cannot review their own PR)",
    );
    return;
  }

  if (DRY_RUN) {
    console.log(
      `🧪 [DRY RUN] Assign reviewer "${reviewer}" to PR #${context.prNumber}`,
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
