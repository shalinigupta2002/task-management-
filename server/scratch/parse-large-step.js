import fs from "fs";

function main() {
  const file = "scratch/large_step.json";
  if (!fs.existsSync(file)) return;
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  const args = data.tool_calls[0].args;
  console.log("StartLine:", args.StartLine);
  console.log("EndLine:", args.EndLine);
  console.log("TargetContent length:", args.TargetContent.length);
  console.log("ReplacementContent length:", args.ReplacementContent.length);
  console.log("TargetContent starts with:", JSON.stringify(args.TargetContent.slice(0, 100)));
  console.log("TargetContent ends with:", JSON.stringify(args.TargetContent.slice(-100)));
}

main();
