/**
 * webhook.js
 *
 * This module acts as the central orchestrator for processing incoming
 * GitHub webhook events. It coordinates all major components of the system:
 *
 * - Configuration loading
 * - Rule evaluation
 * - Action execution
 * - Audit logging
 *
 * It represents the "control flow layer" of the architecture.
 *
 * Execution Flow:
 * 1. Receive webhook event
 * 2. Load configuration
 * 3. Evaluate rules
 * 4. Execute resulting actions
 * 5. Log decisions for auditability
 *
 * Key Responsibilities:
 * - Ensure proper sequencing of system components
 * - Provide observability via structured logging
 * - Handle errors gracefully to prevent system failure
 */

import { loadConfig } from "./configLoader.js";
import { evaluateRules } from "./ruleEngine.js";
import { executeActions } from "./actions.js";
import { logDecision } from "./auditLogger.js";

/**
 * Main webhook handler
 * @param {object} event - GitHub webhook payload
 */
export async function handleWebhook(event) {
  try {
    // 1. Log incoming event (observability)
    console.log("Incoming event:");
    console.log(JSON.stringify(event, null, 2));

    // 2. Load configuration
    const config = loadConfig();
    console.log("Loaded config:", config);

    // 3. Evaluate rules
    const actions = evaluateRules(event, config);
    console.log("Rule engine decisions:", actions);

    // 4. Handle no-match case
    if (!actions || actions.length === 0) {
      console.log("No matching rules. No actions executed.");
      return;
    }

    // 5. Execute actions
    await executeActions(actions, event);

    // 6. Audit logging
    logDecision(event, actions);

  } catch (error) {
    // 7. Error handling (critical for reliability)
    console.error("Error in webhook handler:", error);
  }
}