export function evaluateRules(event, config) {
  const decisions = [];

  for (const rule of config.rules) {
    // Always trigger (for demo mode)
    if (rule.condition === "always") {
      decisions.push(rule.action);
      continue;
    }

    // New contributor
    if (rule.condition === "new_contributor") {
      const association = event.pull_request?.author_association;

      if (!association || association === "NONE") {
        decisions.push(rule.action);
      }
      continue;
    }

    // No assignee
    if (rule.condition === "no_assignee") {
      const assignees = event.pull_request?.assignees || [];

      if (assignees.length === 0) {
        decisions.push(rule.action);
      }
      continue;
    }
  }

  return decisions;
}