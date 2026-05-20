const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const ora = require("ora").default;
const fetch = require("node-fetch");

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "XMLM:latest";

// --------------------------------------------------
// Parse terminal arguments
// --------------------------------------------------

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(chalk.red("No XML files provided."));
  console.log("");
  console.log("Usage:");
  console.log(chalk.cyan("node xmlm.js <file.xml> [summary]"));
  console.log(chalk.cyan("node xmlm.js <a.xml> <b.xml> compare"));
  process.exit(1);
}

// Detect task
let task = "summary";

const lastArg = args[args.length - 1];

if (lastArg === "summary" || lastArg === "compare") {
  task = args.pop();
}

const files = args;

// --------------------------------------------------
// Read XML files
// --------------------------------------------------

function readXmlFiles(filePaths) {
  const contents = [];

  for (const file of filePaths) {
    const fullPath = path.resolve(__dirname, file);

    if (!fs.existsSync(fullPath)) {
      console.log(chalk.red(`File not found: ${fullPath}`));
      process.exit(1);
    }

    const xml = fs.readFileSync(fullPath, "utf8");

    contents.push({
      name: path.basename(fullPath),
      path: fullPath,
      content: xml,
    });
  }

  return contents;
}

// --------------------------------------------------
// Build prompt
// --------------------------------------------------

function buildPrompt(task, filesData) {
  let prompt = "";

  prompt += `TASK:\n`;
  prompt += `${task}\n\n`;

  prompt += `FILES:\n`;

  filesData.forEach((file, index) => {
    prompt += `\n--- FILE ${index + 1} ---\n`;
    prompt += `NAME: ${file.name}\n`;
    prompt += `PATH: ${file.path}\n\n`;

    prompt += `XML CONTENT:\n`;
    prompt += `${file.content}\n`;
  });

  return prompt;
}

// --------------------------------------------------
// Send request to Ollama
// --------------------------------------------------

async function askOllama(prompt) {
  const spinner = ora({
    text: "Waiting for XMLM response...",
    color: "cyan",
  }).start();

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: true,
      }),
    });

    spinner.stop();

    let finalText = "";

    for await (const chunk of response.body) {
      const lines = chunk.toString().split("\n");

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const json = JSON.parse(line);

          if (json.response) {
            process.stdout.write(json.response);
            finalText += json.response;
          }
        } catch (err) {
          // ignore malformed chunks
        }
      }
    }

    console.log("\n");

    return finalText;
  } catch (error) {
    spinner.fail("Failed to contact Ollama");
    console.log(chalk.red(error.message));
    process.exit(1);
  }
}

// --------------------------------------------------
// Main
// --------------------------------------------------

async function main() {
  console.log("");
  console.log(chalk.blue("XMLM Local Client"));
  console.log(chalk.gray("-------------------"));

  console.log(chalk.yellow("Task:"), task);
  console.log(chalk.yellow("Files:"), files.length);

  const filesData = readXmlFiles(files);

  filesData.forEach((file) => {
    console.log(chalk.gray(`- ${file.name}`));
  });

  const prompt = buildPrompt(task, filesData);

  const result = await askOllama(prompt);

  console.log("");
  console.log(chalk.green("XMLM Response"));
  console.log(chalk.gray("-------------------"));
  console.log(result.trim());
  console.log("");
}

main();