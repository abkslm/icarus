import * as tmi from "tmi.js"
import * as commandFns from "./commandFns.js"
import * as utils from "./utilities.js"

import cmds from "../config/commands.json" with { type: "json" }
import config from "../config/config.json" with { type: "json" }

const client = new tmi.client(config["tmi"]);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

async function onMessageHandler (target: string, contact: object, msg: string, self: boolean)      {
    if (self) { return; }

    console.log(`typeof target: ${typeof target}, typeof contact: ${typeof contact}, typeof msg: ${typeof msg}`);

    const modDecision = await utils.moderate(msg)

    console.log(`\nTarget: ${target}\nContact: ${contact}\nMsg: ${msg}\n}`)

    // console.log(contact)

    // const uuid = contact.

    //todo remove this later

    // console.log(`decision: ${modDecision}`)
    client.say(target, String(modDecision))

    if (msg[0] === "!") {
        const input = msg.split(" ");
        const commandName = input[0];
        const args = input.slice(1)
        if (isValidTextCommand(commandName, cmds.text)) {
            client.say(target, cmds.text[commandName]);
        } else if (isValidFunctionCommand(commandName, cmds.functions)) {
            const functionName = cmds.functions[commandName as keyof typeof cmds.functions];
            if (isAvailableFunction(functionName, commandFns)) {
                client.say(target, commandFns[functionName](args));
            }
        }
    }

}

function onConnectedHandler (addr: string, port: Number) {
    console.log(`typeof addr: ${typeof addr}, typeof port: ${typeof port}`);
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
