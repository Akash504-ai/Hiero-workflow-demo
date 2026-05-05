import { loadConfig } from "./configLoader.js";
import { evaluateRules } from "./ruleEngine.js";
import { executeActions } from "./actions.js";
import { logDecision } from "./auditLogger.js";

export async function handleWebhook(event) {
  try {
    // 🔍 1. Log incoming event (observability)
    console.log("📩 Incoming event:");
    console.log(JSON.stringify(event, null, 2));

    // ⚙️ 2. Load config
    const config = loadConfig();
    console.log("⚙️ Loaded config:", config);

    // 🧠 3. Evaluate rules
    const actions = evaluateRules(event, config);
    console.log("🧠 Rule engine decisions:", actions);

    // ⚠️ 4. Handle no-match case (important!)
    if (!actions || actions.length === 0) {
      console.log("⚠️ No matching rules. No actions executed.");
      return;
    }

    // 🚀 5. Execute actions
    await executeActions(actions, event);

    // 📜 6. Audit logging
    logDecision(event, actions);

  } catch (error) {
    // ❌ 7. Error handling (VERY important for real systems)
    console.error("❌ Error in webhook handler:", error);
  }
}