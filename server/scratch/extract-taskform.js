import fs from "fs";

const logPath = "C:\\Users\\SHALU\\.gemini\\antigravity\\brain\\54b6d663-0ea4-4591-8ed8-7c9cc4fb5b6d\\.system_generated\\logs\\transcript_full.jsonl";

function main() {
  if (!fs.existsSync(logPath)) {
    console.error("Log file does not exist:", logPath);
    return;
  }

  const content = fs.readFileSync(logPath, "utf-8");
  const lines = content.split("\n");

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const obj = JSON.parse(line);
      // Let's check tool_calls and their responses
      // In JSONL, the step object for the tool response has a type: "PLANNER_RESPONSE" or is the output of the next step
      // Let's search if this step contains "TaskForm.jsx" and is very large (e.g. > 10000 characters)
      const text = JSON.stringify(obj);
      if (text.includes("TaskForm.jsx") && text.includes("estimatedHours") && text.length > 20000) {
        console.log(`Found large line matching criteria at index ${i}, step index ${obj.step_index}, size: ${text.length}`);
        
        // Let's find the content of the file. It's likely in the content or output of a tool call response
        // Let's write the JSON object to a file to examine it
        fs.writeFileSync("scratch/large_step.json", JSON.stringify(obj, null, 2));
        console.log("Saved step JSON to scratch/large_step.json");
        return;
      }
    } catch (e) {
      // ignore
    }
  }
  console.log("No matching large step found.");
}

main();
