export function evaluateRules(event, config) {
  const decisions = [];

  for (const rule of config.rules) {
    if (rule.condition === "new_contributor") {
      // simple mock logic
      if (!event.pull_request?.author_association || event.pull_request.author_association === "NONE") {
        decisions.push(rule.action);
      }
    }

    if (rule.condition === "no_assignee") {
      if (!event.pull_request.assignees.length) {
        decisions.push(rule.action);
      }
    }
  }

  return decisions;
}