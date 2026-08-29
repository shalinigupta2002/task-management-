import fs from "fs";

const logPath = "C:\\Users\\SHALU\\.gemini\\antigravity\\brain\\54b6d663-0ea4-4591-8ed8-7c9cc4fb5b6d\\.system_generated\\logs\\transcript_full.jsonl";

function main() {
  if (!fs.existsSync(logPath)) return;
  const lines = fs.readFileSync(logPath, "utf-8").split("\n");
  const line336 = lines[336];
  if (line336) {
    const obj = JSON.parse(line336);
    console.log("Keys in line336:", Object.keys(obj));
    console.log("Type:", obj.type);
    if (obj.content) {
      fs.writeFileSync("scratch/step336_content.txt", obj.content);
      console.log("Wrote Line 336 content to scratch/step336_content.txt, length:", obj.content.length);
    }
  }
}

main();
