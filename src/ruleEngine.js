/**
 * ruleEngine.js
 *
 * This module is responsible for evaluating incoming GitHub events against
 * a set of configured rules and determining which actions should be executed.
 *
 * It acts as the "decision layer" of the system.
 *
 * Key Responsibilities:
 * - Iterate through configured rules
 * - Evaluate conditions based on event data
 * - Return a list of actions to be executed
 *
 * Supported Conditions:
 * - always → always triggers (useful for demo/testing)
 * - new_contributor → triggers if contributor has no prior association
 * - no_assignee → triggers if pull request has no assignees
 *
 * Output:
 * - Array of action identifiers (strings)
 *
 * Example:
 * Input: event + config
 * Output: ["comment_welcome", "assign_default_reviewer"]
 */

export function evaluateRules(event, config) {
  const decisions = [];

  for (const rule of config.rules) {
    // Condition: always (used for demo/testing)
    if (rule.condition === "always") {
      decisions.push(rule.action);
      continue;
    }

    // Condition: new contributor
    if (rule.condition === "new_contributor") {
      const association = event.pull_request?.author_association;

      if (!association || association === "NONE") {
        decisions.push(rule.action);
      }
      continue;
    }

    // Condition: no assignee on pull request
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