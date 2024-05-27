import * as tmi from "tmi.js"
import * as utils from "./utils.js"
import * as twitchApi from "./twitchAPI.js"
import * as commandFns from "./commandFns.js"

import cmds from "../config/commands.json" with { type: "json" }

const twitch = new twitchApi.TwitchAPI()

const client = new tmi.client(twitch.getTmiConfig());

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

await utils.tmiConnect(client)

async function onMessageHandler (target: string, contact: object, msg: string, self: boolean) {
    if (self) { return; }

    const uuid = contact["user-id" as keyof typeof contact]
    const id = contact["id" as keyof typeof contact]

    const moderationResult = await utils.moderate(msg, id, uuid, twitch)

    if (!moderationResult.allowed && moderationResult.removed) {
        await client.say(target, `Hi ${contact["username" as keyof typeof contact]}! Your message was removed as it violated chat rules.`)
    } else if (!moderationResult.allowed && !moderationResult.removed) {
        console.error(`REMOVAL FAILURE: Message ${id} is not allowed, but could not be removed!!`)
    }

    if (msg[0] === "!") {

        const input = msg.split(" ");
        const commandName = input[0];
        const args = input.slice(1)

        if (isValidTextCommand(commandName, cmds.text)) {
            await client.say(target, cmds.text[commandName]);
        } else if (isValidFunctionCommand(commandName, cmds.functions)) {
            const functionName = cmds.functions[commandName as keyof typeof cmds.functions];
            if (isAvailableFunction(functionName, commandFns)) {
                await client.say(target, commandFns[functionName](args));
            }
        }

    }

}

function onConnectedHandler (addr: string, port: Number) {
    console.log(`* Connected to ${addr}:${port}`);
}

function isValidTextCommand (command: string, commands: typeof cmds.text): command is keyof typeof cmds.text {
    return command in commands
}

function isValidFunctionCommand (command: string, commands: typeof cmds.functions): command is keyof typeof cmds.functions {
    return command in commands
}

function isAvailableFunction(functionName: string, functions: typeof commandFns): functionName is keyof typeof commandFns {
    return typeof functions[functionName as keyof typeof functions] === "function"
}
