import fs from "fs";

const logPath = "C:\\Users\\SHALU\\.gemini\\antigravity\\brain\\54b6d663-0ea4-4591-8ed8-7c9cc4fb5b6d\\.system_generated\\logs\\transcript_full.jsonl";

function main() {
  if (!fs.existsSync(logPath)) return;
  const lines = fs.readFileSync(logPath, "utf-8").split("\n");
  console.log("Total lines in log:", lines.length);
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    console.log(`Line ${i}:`, lines[i].slice(0, 150));
  }
}

main();
