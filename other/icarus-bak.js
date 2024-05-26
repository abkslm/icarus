import * as tmi from "tmi.js"
import * as commandFns from "./commandFns-bak.js"
import * as utils from "./utilities.js"

import cmds from "../config/commands.json" with { type: "json" }
import config from "../config/config.json" with { type: "json" }

const client = new tmi.client(config["tmi"]);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

async function onMessageHandler (target, contact, msg, self)      {

    if (self) { return; }

    console.log(`typeof target: ${typeof target}, typeof contact: ${typeof contact}, typeof msg: ${typeof msg}, typeof self: ${typeof self}`);

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
        if (commandName in cmds.text) {
            client.say(target, cmds.text[commandName]);
        } else if (commandName in cmds.functions) {
            client.say(target, commandFns[cmds.functions[commandName]](args));
        }
    }

}

function onConnectedHandler (addr, port) {
    console.log(`typeof addr: ${typeof addr}, typeof port: ${typeof port}`);
    console.log(`* Connected to ${addr}:${port}`);
}



