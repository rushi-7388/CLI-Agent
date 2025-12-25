#!/usr/bin/env node


import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";
import {Command} from "commander";
import { login } from "./commands/auth/login.js";
import { logout } from "./commands/auth/login.js";
import { whoami } from "./commands/auth/login.js";

dotenv.config();


async function main() {
    console.log(
        chalk.cyan(
            figlet.textSync("CLI Agent", {
                font: "Standard",
                horizontalLayout: "default",
            })
        )
    )

    console.log(chalk.red("Starting CLI Agent Server...\n"));

    const program = new Command("cli-agent");
    program.version("1.0.0").description("CLI Agent - A powerful CLI tool")
    .addCommand(login)
    .addCommand(logout)
    .addCommand(whoami);

    program.action(() => {
        program.help()
    })

    program.parse()
}

main().catch((err) => {
    console.error(chalk.red("Error starting CLI Agent Server:"), err)
    process.exit(1);
});