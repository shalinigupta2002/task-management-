import fs from "fs";

function main() {
  const file = "scratch/step336_content.txt";
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, "utf-8");
  console.log("Length:", content.length);
  
  const lines = content.split("\n");
  console.log("Total lines in step336_content:", lines.length);
  console.log("First 15 lines:\n", lines.slice(0, 15).join("\n"));
  console.log("Last 15 lines:\n", lines.slice(-15).join("\n"));
}

main();
