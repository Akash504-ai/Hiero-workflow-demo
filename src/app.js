import express from "express";
import bodyParser from "body-parser";
import { handleWebhook } from "./webhook.js";

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  await handleWebhook(req.body);
  res.send("ok");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});