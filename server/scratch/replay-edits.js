import fs from "fs";

function main() {
  const editsFile = "scratch/taskform_edits.json";
  if (!fs.existsSync(editsFile)) {
    console.error("taskform_edits.json does not exist");
    return;
  }

  const edits = JSON.parse(fs.readFileSync(editsFile, "utf-8"));
  
  // Start with the original 64-line version of TaskForm.jsx
  // We checked it out from git, so we can read it from the repository
  const originalPath = "../task-management-portal-ui/src/components/tasks/TaskForm.jsx";
  if (!fs.existsSync(originalPath)) {
    console.error("TaskForm.jsx does not exist at:", originalPath);
    return;
  }

  let code = fs.readFileSync(originalPath, "utf-8");
  console.log(`Original file size: ${code.length} chars, lines: ${code.split("\n").length}`);

  edits.forEach((edit, idx) => {
    console.log(`\nReplaying edit ${idx + 1} (Step ${edit.step_index}, tool: ${edit.tool})`);
    
    if (edit.tool === "replace_file_content") {
      const target = edit.args.TargetContent;
      const replacement = edit.args.ReplacementContent;
      
      // Normalize line endings to avoid \r\n mismatches
      const normCode = code.replace(/\r\n/g, "\n");
      const normTarget = target.replace(/\r\n/g, "\n");
      const normReplacement = replacement.replace(/\r\n/g, "\n");

      if (normCode.includes(normTarget)) {
        code = normCode.replace(normTarget, normReplacement);
        console.log(`  Success! File size now: ${code.length} chars, lines: ${code.split("\n").length}`);
      } else {
        console.warn(`  Warning: Target content not found in code for edit ${idx + 1}!`);
        // Let's print a small preview of target
        console.log("  Target preview:", JSON.stringify(target.slice(0, 100)));
      }
    } else if (edit.tool === "multi_replace_file_content") {
      const chunks = edit.args.ReplacementChunks || [];
      console.log(`  Applying ${chunks.length} chunks...`);
      chunks.forEach((chunk, cIdx) => {
        const target = chunk.TargetContent;
        const replacement = chunk.ReplacementContent;
        
        const normCode = code.replace(/\r\n/g, "\n");
        const normTarget = target.replace(/\r\n/g, "\n");
        const normReplacement = replacement.replace(/\r\n/g, "\n");

        if (normCode.includes(normTarget)) {
          code = normCode.replace(normTarget, normReplacement);
          console.log(`    Chunk ${cIdx + 1} success!`);
        } else {
          console.warn(`    Warning: Target content for chunk ${cIdx + 1} not found!`);
          console.log("    Target preview:", JSON.stringify(target.slice(0, 100)));
        }
      });
      console.log(`  After multi-replace: file size ${code.length} chars, lines: ${code.split("\n").length}`);
    }
  });

  // Write the final replayed code back to scratch/replayed_TaskForm.jsx
  fs.writeFileSync("scratch/replayed_TaskForm.jsx", code);
  console.log("\nReplay finished! Output written to scratch/replayed_TaskForm.jsx");
}

main();
