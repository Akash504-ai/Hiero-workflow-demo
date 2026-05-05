import dotenv from "dotenv";
dotenv.config();

const DRY_RUN = process.env.DRY_RUN === "true";

// 🎯 Main executor
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

// 🧠 Build normalized context (important for scaling)
function buildContext(event) {
  return {
    repo: event.repository?.full_name,
    owner: event.repository?.owner?.login || "demo-owner",
    repoName: event.repository?.name || "demo-repo",
    prNumber: event.pull_request?.number || 1,
    author: event.pull_request?.user?.login || "unknown-user",
  };
}

// 🔀 Action router (clean separation)
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

// 💬 Action: Comment
async function commentWelcome(context) {
  const message = `👋 Welcome @${context.author}! Thanks for your contribution.`;

  if (DRY_RUN) {
    console.log(`🧪 [DRY RUN] Comment on PR #${context.prNumber}: "${message}"`);
    return;
  }

  // 🔥 Future: Replace with Octokit API
  console.log(`🚀 Commenting on PR #${context.prNumber}: "${message}"`);
}

// 👥 Action: Assign reviewer
async function assignDefaultReviewer(context) {
  const reviewer = "maintainer-username"; // configurable later

  if (DRY_RUN) {
    console.log(`🧪 [DRY RUN] Assign reviewer "${reviewer}" to PR #${context.prNumber}`);
    return;
  }

  // 🔥 Future: Replace with Octokit API
  console.log(`🚀 Assigning reviewer "${reviewer}" to PR #${context.prNumber}`);
}