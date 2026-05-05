import fs from "fs";
import yaml from "yaml";

export function loadConfig() {
  const file = fs.readFileSync("./config/rules.yml", "utf8");
  return yaml.parse(file);
}