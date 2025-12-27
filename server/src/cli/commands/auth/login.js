import { cancel,confirm,intro , isCancel , outro } from "@clack/prompts"
import {logger} from "better-auth"
import {createAuthClient} from "better-auth/client"
import { deviceAuthorizationClient } from "better-auth/client/plugins"

import chalk from "chalk"
import {  Command } from "commander"
import fs from "node:fs/promises"
import open from "open"
import os from "os"
import path from "path"
import yoctoSpinner from "yocto-spinner"
import * as z from "zod/v4"
import dotenv from "dotenv"
import prisma from "../../../lib/db.js"
// import { getStoredToken, isTokenExpired, storeToken } from "../../../lib/token.js"

dotenv.config()

// Base URL of the Better Auth API on the server
const URL = "http://localhost:3005"
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
export const CONFIG_DIR = path.join(os.homedir(),".better-auth");
export const TOKEN_FILE = path.join(CONFIG_DIR , "token.json");

export async function getStoredToken() {
    try {
        const data = await fs.readFile(TOKEN_FILE,"utf-8");
        const token = JSON.parse(data);
        return token;
    } catch (error) {
        return null;
    }
}

export async function storeToken(token) {
    try{
        await fs.mkdir(CONFIG_DIR,{recursive:true});

        const tokenData = {
            access_token:token.access_token,
            refresh_token:token.refresh_token,
            token_type:token.token_type || "Bearer",
            scope:token.scope,
            expires_at:token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null,
            created_at:new Date().toISOString(),
        };

        await fs.writeFile(TOKEN_FILE, JSON.stringify(tokenData,null,2),"utf-8");
        return true;
    }
    catch(error){
        console.error(chalk.red("Failed to store token:"),error.message);
        return false;
    }
}

export async function clearStoredToken() {
    try {
        await fs.unlink(TOKEN_FILE);
        return true;
    } catch (error) {
        return false;
    }
}


export async function isTokenExpired() {
    const token = await getStoredToken();
    if(!token || !token.expires_at) {
        return true;
    }

    const expiresAt = new Date(token.expires_at);
    const now = new Date();

    return expiresAt.getTime() - now.getTime() < 5 * 60 * 1000;
}

export async function requireAuth(){
    const token = await getStoredToken();

    if(!token){
        console.log(chalk.red("❌ You are not logged in. Please run 'cli-agent login' to authenticate."))
        process.exit(1);
    }

    if(await isTokenExpired()){
        console.log(chalk.yellow("⚠️ Your token has expired. Please run 'auth login' to re-authenticate."));
        console.log(chalk.gray("   Run : Your CLI Login\n"));
        process.exit(1);
    }

    return token;
}

export async function loginAction(opts){
    const options = z.object({
        serverUrl:z.string().optional(),
        clientId:z.string().optional()
    })

    const serverUrl = options.serverUrl || URL;
    const clientId = options.clientId || CLIENT_ID;

    intro(chalk.bold("🔏Auth CLI Agent Login"))

    const exisitingToken = await getStoredToken();
    const expired = await isTokenExpired();

    if(exisitingToken && !expired){
        const shouldReAuth = await confirm({
            message:"You are already logged in. Do you want to re-authenticate?",
            initialValue:false
        })

        if(isCancel(shouldReAuth) || !shouldReAuth) {
            cancel("Login Cancelled")
            process.exit(0)
        }
    }

    const authClient = createAuthClient({
        baseURL : serverUrl,
        plugins:[deviceAuthorizationClient()]
    })

    const spinner = yoctoSpinner({ text:"Requesting Device Authorization..." })
    spinner.start();

    try {
        const {data,error} = await authClient.device.code({
            client_id:clientId,
            scope:"openid profile email"
        })
        spinner.stop();

        if(error || !data){
            // Log the full error object so we can actually see what Better Auth is returning
            logger.error(`Failed to Request Device Authorization ${error.error_description}`);
            // if (error?.error_description) {
            //     logger.error(`Details: ${error.error_description}`);
            // }
            process.exit(1)
        }

        const {
            device_code,
            user_code,
            verification_uri,
            verification_uri_complete,
            expires_in,
            interval= 5
        } = data;

        console.log(chalk.green("\n✅ Device Authorization Required!"))

        console.log(`Please Visit" ${chalk.underline.blue(verification_uri || verification_uri_complete)}` )

        console.log(`Enter Code: ${chalk.bold.green(user_code)}`)

        const shouldOpen = await confirm({
            message:"Open Browser Automatically?",
            initialValue:true
        })

        if(!isCancel(shouldOpen) && shouldOpen){
            const urlToOpen =  verification_uri_complete || verification_uri;
            await open(urlToOpen)
        }

        console.log(chalk.gray(
            `Waiting for Authorization (expires in ${Math.floor(
                expires_in / 60
            )} minutes)...`
        )
    );

    const token = await pollForToken(
        authClient,
        device_code,
        clientId,
        interval
    )
    if(token){
        const saved = await storeToken(token)

        if(!saved){
            console.log(chalk.yellow("⚠️ Warning: Failed to save token locally. You may need to re-authenticate next time."))

            console.log(chalk.yellow("You may need to Login on next use."))
        }

        outro(chalk.green("🎉 Successfully Logged In!") )

        console.log(chalk.gray(`\n Token Saved to: ${TOKEN_FILE}`))

        console.log(chalk.gray("You can now use the CLI with authenticated requests.\n"))
    }
    } catch (error) {
        spinner.stop();
        console.error(chalk.red("Login Failed:"),error.message);
        process.exit(1);
    }
}


async function pollForToken(authClient, deviceCode, clientId, initialInterval) {
    let pollingInterval = initialInterval
    const spinner = yoctoSpinner({text:"", color:"cyan"});
    let dots = 0;

    return new Promise((resolve, reject) => {
        const poll = async () => {
            dots = (dots+1)%4;
            spinner.text = chalk.cyan(`Polling for Authorization${".".repeat(dots)}${" ".repeat(3-dots)}`
        );
        if(!spinner.isSpinning) spinner.start();

        try {
            const { data,error } = await authClient.device.token({
                
                grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                device_code:deviceCode,
                client_id: clientId,
                fetchOptions: {
                headers: {
                    "user-agent": `My CLI`,
                },
                }
            });


            if(data?.access_token){
                console.log(chalk.bold.yellow(`Your Access Token : ${data.access_token}`))

                spinner.stop();
                resolve(data);
                return; 

            }

            else if(error) {
                switch (error.error) {
                    case "authorization_pending":
                        // Continue polling
                        break;
                    case "slow_down":
                        pollingInterval += 5;
                        break;
                    case "access_denied":
                        console.error("Access was denied by the user");
                        return;
                    case "expired_token":
                        console.error("The device code has expired. Please try again.");
                        return;
                    default:
                        spinner.stop();
                        logger.error(`Error: ${error.error_description}`);
                        process.exit(1);
                    }
            }
        } catch (error) {
            spinner.stop();
            logger.error(`Network Error: ${error.message}`);
            process.exit(1);
        }

        setTimeout(poll, pollingInterval * 1000);

        }

        setTimeout(poll, pollingInterval * 1000);
    })
}

export async function logoutAction() {
    intro(chalk.bold("🔐 CLI Agent Logout"))

    const token = await getStoredToken();

    if(!token){
        console.log(chalk.yellow("⚠️ You are not logged in."));
        process.exit(0);
    }

    const shouldLogout = await confirm({
        message:"Are you sure you want to logout?",
        initialValue:false
    });

    if(isCancel(shouldLogout) || !shouldLogout){
        cancel("Logout Cancelled");
        process.exit(0);
    }

    const cleared = await clearStoredToken();

    if(cleared){
        outro(chalk.green("✅ Successfully Logged Out!"));
    } else {
        console.log(chalk.red("❌ Could not clear token file."));
    }
}

export async function whoamiAction(opts) { 
    const token = await requireAuth();
    if(!token?.access_token){
        console.log("No Access Token Found. Please Login");
        process.exit(1);
    }

    const user = await prisma.user.findFirst({
        where:{
            sessions:{
                some:{
                    token:token.access_token,
                },
            },
        },
        select:{
            id:true,
            name:true,
            email:true,
            image:true
        },
    });

    console.log(chalk.bold.blueBright(`\n 👤 Logged in as: ${user.name} 📧 Email : ${user.email} 🆔 ID : ${user.id}`));
}


export const login = new Command("login").description("Login to CLI Agent")
.option("--server-url <url>","The Better Auth Server URL" , URL)
.option("--client-id <id>","The OAuth Client ID" , CLIENT_ID)
.action(loginAction)


export const logout = new Command("logout").description("Logout from CLI Agent and Clear Stored Credentials").action(logoutAction);

export const whoami = new Command("whoami").description("Display the currently authenticated user")
.option("--server-url <url>" , "The CLI Auth Server URL" , URL).action(whoamiAction);