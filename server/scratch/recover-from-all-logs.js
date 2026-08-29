import fs from "fs";
import path from "path";

const brainDir = "C:\\Users\\SHALU\\.gemini\\antigravity\\brain";

function main() {
  if (!fs.existsSync(brainDir)) {
    console.error("Brain directory not found");
    return;
  }

  const items = fs.readdirSync(brainDir);
  console.log("Found brain subdirectories:", items.length);

  items.forEach(folder => {
    // Check both files
    ["transcript_full.jsonl", "transcript.jsonl"].forEach(logFileName => {
      const logFile = path.join(brainDir, folder, ".system_generated", "logs", logFileName);
      if (fs.existsSync(logFile)) {
        console.log(`Scanning log file ${logFileName} for folder: ${folder}...`);
        try {
          const content = fs.readFileSync(logFile, "utf-8");
          const lines = content.split("\n");
          lines.forEach((line, idx) => {
            if (!line.trim()) return;
            try {
              const obj = JSON.parse(line);
              if (obj.tool_calls) {
                obj.tool_calls.forEach(tc => {
                  if (tc.name === "write_to_file" || tc.name === "replace_file_content" || tc.name === "multi_replace_file_content") {
                    const file = tc.args.TargetFile || tc.args.targetFile;
                    if (file && file.includes("TaskForm.jsx")) {
                      console.log(`  -> Found TaskForm.jsx write in folder: ${folder}, Log: ${logFileName}, Step: ${obj.step_index}, Tool: ${tc.name}`);
                      if (tc.args.CodeContent) {
                        console.log(`     CodeContent Length: ${tc.args.CodeContent.length}`);
                        fs.writeFileSync(`scratch/recovered_${folder}_step_${obj.step_index}.jsx`, tc.args.CodeContent);
                        console.log(`     Wrote to scratch/recovered_${folder}_step_${obj.step_index}.jsx`);
                      }
                      if (tc.args.ReplacementContent) {
                        console.log(`     ReplacementContent Length: ${tc.args.ReplacementContent.length}`);
                      }
                    }
                  }
                });
              }
            } catch {}
          });
        } catch (err) {
          console.error(`Error reading ${logFile}:`, err.message);
        }
      }
    });
  });
}

main();
