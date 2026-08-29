import fs from "fs";

const logPath = "C:\\Users\\SHALU\\.gemini\\antigravity\\brain\\54b6d663-0ea4-4591-8ed8-7c9cc4fb5b6d\\.system_generated\\logs\\transcript_full.jsonl";

function main() {
  if (!fs.existsSync(logPath)) return;
  const lines = fs.readFileSync(logPath, "utf-8").split("\n");
  console.log("Searching log for exact TaskForm.jsx view responses...");

  lines.forEach((line, idx) => {
    if (!line.trim()) return;
    try {
      const obj = JSON.parse(line);
      const text = JSON.stringify(obj);
      if (obj.content && obj.content.includes("TaskForm.jsx") && obj.content.includes("File Path: `file:///c:/Users/SHALU/OneDrive/Desktop/Task%20Management/task-management-portal-ui/src/components/tasks/TaskForm.jsx`")) {
        console.log(`Found VIEW_FILE response at line ${idx} (Step ${obj.step_index}), content length: ${obj.content.length}`);
        // print showing lines range:
        const rangeMatch = obj.content.match(/Showing lines (\d+) to (\d+)/);
        if (rangeMatch) {
          console.log(`  Range: ${rangeMatch[1]} to ${rangeMatch[2]}`);
        }
      }
    } catch {}
  });
}

main();
