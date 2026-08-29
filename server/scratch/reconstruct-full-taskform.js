import fs from "fs";

const logPath = "C:\\Users\\SHALU\\.gemini\\antigravity\\brain\\54b6d663-0ea4-4591-8ed8-7c9cc4fb5b6d\\.system_generated\\logs\\transcript_full.jsonl";

function main() {
  if (!fs.existsSync(logPath)) {
    console.error("Log file does not exist:", logPath);
    return;
  }

  const lines = fs.readFileSync(logPath, "utf-8").split("\n");
  const lineMap = {};

  console.log("Processing log lines...");

  lines.forEach((line, idx) => {
    if (!line.trim()) return;
    try {
      const obj = JSON.parse(line);
      
      // We look for VIEW_FILE steps or system messages containing file contents of TaskForm.jsx
      // Let's find strings in the object that contain: "File Path: `file:///c:/Users/SHALU/OneDrive/Desktop/Task%20Management/task-management-portal-ui/src/components/tasks/TaskForm.jsx`"
      // Or contains "TaskForm.jsx" and line numbers.
      
      const inspectString = (str) => {
        if (str.includes("TaskForm.jsx") && str.includes("Total Lines:") && str.includes("Showing lines")) {
          // Parse lines
          // Line format is like "123: const foo = bar;"
          const textLines = str.split("\n");
          let parsingLines = false;
          textLines.forEach((tLine) => {
            if (tLine.includes("Showing lines")) {
              parsingLines = true;
              return;
            }
            if (tLine.includes("The above content shows") || tLine.includes("The above content does NOT show")) {
              parsingLines = false;
              return;
            }
            if (parsingLines) {
              const match = tLine.match(/^\s*(\d+):\s?(.*)$/);
              if (match) {
                const lineNum = parseInt(match[1], 10);
                const lineContent = match[2];
                lineMap[lineNum] = lineContent;
              }
            }
          });
        }
      };

      // Check content, thinking, etc.
      if (obj.content) inspectString(obj.content);
      if (obj.thinking) inspectString(obj.thinking);
      if (obj.tool_calls) {
        obj.tool_calls.forEach(tc => {
          if (tc.args && tc.args.ReplacementContent) {
            // Wait, if it is a replace_file_content call, it has StartLine, EndLine, and ReplacementContent
            const start = tc.args.StartLine;
            const end = tc.args.EndLine;
            if (tc.args.TargetFile && tc.args.TargetFile.includes("TaskForm.jsx") && start && end) {
              const repLines = tc.args.ReplacementContent.split("\n");
              // Wait, if it's replace_file_content, we can't easily map 1-to-1 if the replacement content has a different number of lines.
              // But step 622's TargetContent has the EXACT original lines!
              // Let's parse TargetContent if it contains line numbers? No, TargetContent does not have line numbers.
              // Let's see if we have viewed it.
            }
          }
        });
      }
    } catch {}
  });

  // Let's print how many lines we successfully recovered
  const lineNumbers = Object.keys(lineMap).map(Number).sort((a, b) => a - b);
  console.log("Total unique lines recovered:", lineNumbers.length);
  if (lineNumbers.length > 0) {
    console.log("Min line number:", lineNumbers[0]);
    console.log("Max line number:", lineNumbers[lineNumbers.length - 1]);
    
    // Check for gaps
    const gaps = [];
    for (let i = lineNumbers[0]; i <= lineNumbers[lineNumbers.length - 1]; i++) {
      if (lineMap[i] === undefined) {
        gaps.push(i);
      }
    }
    console.log("Gaps in line numbers:", gaps.length > 10 ? `${gaps.length} gaps, first few: ${gaps.slice(0, 10).join(",")}` : gaps.join(","));
    
    // Write out the recovered lines to a file
    const reconstructedCode = [];
    for (let i = 1; i <= lineNumbers[lineNumbers.length - 1]; i++) {
      reconstructedCode.push(lineMap[i] !== undefined ? lineMap[i] : `// MISSING LINE ${i}`);
    }
    
    fs.writeFileSync("scratch/reconstructed_TaskForm.jsx", reconstructedCode.join("\n"));
    console.log("Wrote reconstructed code to scratch/reconstructed_TaskForm.jsx");
  }
}

main();
