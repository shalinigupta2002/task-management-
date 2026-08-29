import fs from "fs";

const logPath = "C:\\Users\\SHALU\\.gemini\\antigravity\\brain\\54b6d663-0ea4-4591-8ed8-7c9cc4fb5b6d\\.system_generated\\logs\\transcript_full.jsonl";

function main() {
  if (!fs.existsSync(logPath)) return;
  const lines = fs.readFileSync(logPath, "utf-8").split("\n");
  const edits = [];

  lines.forEach((line) => {
    if (!line.trim()) return;
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        obj.tool_calls.forEach(tc => {
          const file = tc.args.TargetFile || tc.args.targetFile;
          if (file && file.includes("TaskForm.jsx")) {
            if (tc.name === "replace_file_content" || tc.name === "multi_replace_file_content") {
              edits.push({
                step_index: obj.step_index,
                tool: tc.name,
                args: tc.args
              });
            }
          }
        });
      }
    } catch {}
  });

  console.log("Total edits found:", edits.length);
  fs.writeFileSync("scratch/taskform_edits.json", JSON.stringify(edits, null, 2));
  console.log("Saved edits to scratch/taskform_edits.json");
}

main();
