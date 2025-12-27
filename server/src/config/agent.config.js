import { promises as fs } from "fs";
import path from "path";
import chalk from "chalk";
import { generateObject } from "ai";
// import z, { success } from "zod";
import { z } from "zod/v3";

const ApplicationSchema = z.object({
  folderName:z.string().describe("Kebab-Case folder name for the appliation"),
  description:z.string().describe("Brief description of what was created"),
  files:z.array(
    z.object({
      path:z.string().describe("Relative file path (e.g src/App.jsx)"),
      content:z.string().describe("Complete File Content")
    }).describe("All Files Needed for the Application")
  ),
  setupCommands:z.array(
    z.string().describe("Bash Commands to Setup and Run (e.g npm install , npm run dev)")
  ),
  dependencies: z.array(
  z.object({
    name: z.string(),
    version: z.string()
  })
).optional()
  .describe('NPM Dependencies with Versions')
})

function printSystem(message){
    console.log(message)
}

function displayFileTree(files, folderName) {
  printSystem(chalk.cyan('\n 📂 Project Structure:'));
  printSystem(chalk.white(`${folderName}/`));

  const filesByDir = {};
  files.forEach(file => {
    const parts = file.path.split('/');
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '';

    if (!filesByDir[dir]) {
      filesByDir[dir] = [];
    }
    filesByDir[dir].push(parts[parts.length - 1]);
  });

  Object.keys(filesByDir).sort().forEach(dir => {
    if(dir) {
        printSystem(chalk.white(`|-- ${dir}/`));
        filesByDir[dir].forEach(file => {
            printSystem(chalk.white(`|   - ${file}`))
        })
    } else {
        filesByDir[dir].forEach(file => {
            printSystem(chalk.white(`|  - ${file}`))
        })
    }
  });
}


async function createApplicationFiles(baseDir,folderName,files) {
  const appDir = path.join(baseDir,folderName);

  await fs.mkdir(appDir, { recursive:true })
  printSystem(chalk.cyan(`\n Created directory: ${folderName}/`))

  for(const file of files) {
    const filePath = path.join(appDir,file.path)
    const fileDir = path.dirname(filePath)

    await fs.mkdir(fileDir,{recursive:true})
    await fs.writeFile(filePath,file.content, 'utf-8')
    printSystem(chalk.green(` ✅ ${file.path}`))
  }
  return appDir
}


export async function generateApplication(description, aiService, cwd=process.cwd()) {
    try {
        printSystem(chalk.cyan('\n🤖 Agent Mode: Generating your application...\n'));
        printSystem(chalk.gray(`Request: ${description}\n`));

        printSystem(chalk.magenta('🤖 Agent Response:\n'));

        const result = await generateObject({
            model:aiService.model,
            schema:ApplicationSchema,
            prompt: `Create a complete, production-ready application for: ${description}

CRITICAL REQUIREMENTS:
1. Generate ALL files needed for the application to run
2. Include package.json with ALL dependencies and correct versions
3. Include README.md with setup instructions
4. Include configuration files (.gitignore, etc.)
5. Write clean, well-commented, production-ready code
6. Include error handling and input validation
7. Use modern JavaScript/TypeScript best practices
8. Make sure all imports and paths are correct
9. NO PLACEHOLDERS - everything must be complete and working

Provide:
- A meaningful kebab-case folder name
- All necessary files with complete content
- Setup commands (cd folder, npm install, npm run dev, etc.)
- All dependencies with versions`,
        })
        const application = result.object

        printSystem(chalk.green(`\n Generated : ${application.folderName}\n`));
        printSystem(chalk.gray(`\n Description : ${application.description}\n`));

        if(application.files.length === 0) {
            throw new Error('No Files were generated')
        }
        
        printSystem(chalk.cyan('\n Creating Files...\n'))

        displayFileTree(application.files , application.folderName)

        const appDir = await createApplicationFiles(cwd,application.folderName , application.files)
        

        printSystem(chalk.green.bold('\n Application Created Successfully!\n'))
        printSystem(chalk.cyan(`\n Location : ${chalk.bold(appDir)}\n`))

        if (application.setupCommands.length > 0) {
  printSystem(chalk.cyan("📋 Next Steps:\n"));
  printSystem(chalk.white("```bash"));
  application.setupCommands.forEach((cmd) => {
    printSystem(chalk.white(cmd));
  });

  printSystem(chalk.white("```\n"));
}

return {
  folderName:application.folderName,
  appDir,
  files:application.files.map(f=>f.path),
  commands:application.setupCommands,
  success:true
}
} catch (error) {
    printSystem(chalk.red(`\n Error Generating application ${error.message}\n`))
    if(error.stack) {
        printSystem(chalk.dim(error.stack + '\n'))
    }
    throw error
}
}