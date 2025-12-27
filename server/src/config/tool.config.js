import { google } from "@ai-sdk/google";
import chalk from "chalk";
import fs from "fs/promises"
import { exec } from "child_process";
import util from "util";
const execAsync = util.promisify(exec);
import { tool } from "ai";


// const modelTools = ["google_search", "code_execution", "url_context"];
// const localTools = ["read_file", "write_file", "run_command"];

export const availableTools = [
  {
    id: "google_search",
    name: "Google Search",
    description:
      "Access the latest information using Google Search. Useful for current events, news, and real-time information",
    getTool: () => google.tools.googleSearch({}),
    enabled: false,
  },
  {
  id: "code_execution",
  name: "Code Execution",
  description:
    "Generate and execute Python code to perform calculations, solve problems, or provide accurate information.",
  getTool: () => google.tools.codeExecution({}),
  enabled: false,
},
{
  id: "url_context",
  name: "URL Context",
  description:
    "Provide specific URLs that you want the model to analyze directly from the prompt. Supports up to 20 URLs per request.",
  getTool: () => google.tools.urlContext({}),
  enabled: false,
},
// {
//   id: "read_file",
//   name: "Read File",
//   description: "Read a local file and return its content.",
//   // getTool: () => ({
//   //   execute: async ({ path }) => {
//   //     if (!path) {
//   //       throw new Error("Path is required");
//   //     }

//   //     try {
//   //       const content = await fs.readFile(path, "utf-8");
//   //       return content;
//   //     } catch (err) {
//   //       return `Error reading file: ${err.message}`;
//   //     }
//   //   },
//   // }),
//   getTool: () => ({
//   description: "Read a local file",
//   parameters: {
//     type: "object",
//     properties: {
//       path: {
//         type: "string",
//         description: "Path of the file to read",
//       },
//     },
//     required: ["path"],
//   },
//   execute: async ({ path }) => {
//     return await fs.readFile(path, "utf-8");
//   },
// }),
//   enabled: true,
// },

{
  id: "read_file",
  name: "Read File",
  description: "Read a local file and return its content.",
  getTool: () =>
    tool({
      description: "Read a local file",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Path of the file to read",
          },
        },
        required: ["path"],
      },
      execute: async ({ path }) => {
        return await fs.readFile(path, "utf-8");
      },
    }),
  enabled: true,
},


// {
//   id: "write_file",
//   name: "Write File",
//   description: "Write content to a local file.",
//   // getTool: () => ({
//   //   execute: async ({ path, content }) => {
//   //     if (!path || !content) {
//   //       throw new Error("Path and content are required");
//   //     }

//   //     await fs.writeFile(path, content, "utf-8");
//   //     return `File written successfully to ${path}`;
//   //   },
//   // }),
//   getTool: () => ({
//   description: "Write content to a local file",
//   parameters: {
//     type: "object",
//     properties: {
//       path: {
//         type: "string",
//         description: "Path of the file to write (e.g. test.txt)",
//       },
//       content: {
//         type: "string",
//         description: "Content to write into the file",
//       },
//     },
//     required: ["path", "content"],
//   },
//   execute: async ({ path, content }) => {
//     await fs.writeFile(path, content, "utf-8");
//     return `File written successfully to ${path}`;
//   },
// }),
//   enabled: true,
// },


{
  id: "write_file",
  name: "Write File",
  description: "Write content to a local file.",
  getTool: () =>
    tool({
      description: "Write content to a local file",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Path of the file to write (e.g. test.txt)",
          },
          content: {
            type: "string",
            description: "Content to write into the file",
          },
        },
        required: ["path", "content"],
      },
      execute: async ({ path, content }) => {
        await fs.writeFile(path, content, "utf-8");
        return `File written successfully to ${path}`;
      },
    }),
  enabled: true,
},



{
  id: "run_command",
  name: "Run Command",
  description: "Execute a safe shell command on the local machine.",
  getTool: () => ({
    execute: async ({ command }) => {
      if (!command) {
        throw new Error("Command is required");
      }

      // ❗ BASIC SAFETY FILTER
      const blocked = ["rm -rf", "shutdown", "reboot", "del /f"];
      if (blocked.some(b => command.includes(b))) {
        return "Command blocked for security reasons.";
      }

      try {
        const { stdout, stderr } = await execAsync(command, {
          timeout: 5000,
        });

        return stdout || stderr || "Command executed with no output";
      } catch (err) {
        return `Command failed: ${err.message}`;
      }
    },
  }),
  enabled: false, // keep disabled by default
},
];


export function getEnabledTools() {
    const tools = {}

    try {
        for(const toolConfig of availableTools){
            if(toolConfig.enabled){
                tools[toolConfig.id] = toolConfig.getTool()
            }
        }

        if(Object.keys(tools).length > 0){
            console.log(chalk.gray(`[DEBUG] Enabled Tools: ${Object.keys(tools).join(', ')}`))
        } else {
            console.log(chalk.yellow('[DEBUG] No Tools Enabled'))
        }
        return Object.keys(tools).length > 0 ? tools : undefined
    } catch (error) {
        console.error(chalk.red('[ERROR] Failed to Initialize tools:'),error.message)
        console.error(chalk.yellow(' Make Sure You have Latest Version of AI-SDK '),error.message)
        console.error(chalk.yellow('Run : npm install @ai-sdk/google@latest'),error.message)
        return undefined
    }
}

export function toogleTool(toolId) {
    const tool = availableTools.find((t) => t.id === toolId)

    if (tool) {
    tool.enabled = !tool.enabled;

    console.log(
      chalk.gray(
        `[DEBUG] Tool ${toolId} toggled to ${tool.enabled}`
      )
    );

    return tool.enabled;
  }

  console.log(
    chalk.red(`[DEBUG] Tool ${toolId} not found`)
  );

  return false;
}

export function enableTools(toolIds) {
  console.log(
    chalk.gray("[DEBUG] enableTools called with:"),
    toolIds
  );

  availableTools.forEach((tool) => {
    const wasEnabled = tool.enabled;
    tool.enabled = toolIds.includes(tool.id);

    if (tool.enabled !== wasEnabled) {
      console.log(
        chalk.gray(
          `[DEBUG] ${tool.id}: ${wasEnabled} → ${tool.enabled}`
        )
      );
    }
  });

  const enabledCount = availableTools.filter((t) => t.enabled).length;

  console.log(
    chalk.gray(
      `[DEBUG] Total tools enabled: ${enabledCount}/${availableTools.length}`
    )
  );
}

export function getEnabledToolNames() {
    const names = availableTools.filter(t => t.enabled).map(t => t.name)
    console.log(chalk.gray('[DEBUG] getEnabledToolNames returning') , names)
    return names
}

export function resetTools() {
    availableTools.forEach(tool => {
        tool.enabled=false
    });
    console.log(chalk.gray(
        '[DEBUG] All Tools have been Reset'
    ))
}