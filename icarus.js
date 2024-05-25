import * as tmi from "tmi.js"
import * as commandFns from "./commandFns.js"

import cmds from "./commands.json" with { type: "json" }
import config from "./config.json" with { type: "json" }

const client = new tmi.client(config["tmi"]);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

function onMessageHandler (target, contect, msg, self) {
    if (self) { return; }

    const input = msg.split(" ");
    const commandName = input[0];
    const args = input.slice(1)

    if (commandName[0] !== "!") { return; }

    if (commandName in cmds.text) {
        client.say(target, cmds.text[commandName]);
    } else if (commandName in cmds.functions) {
        client.say(target, commandFns[cmds.functions[commandName]](args));
    }

}

function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}



