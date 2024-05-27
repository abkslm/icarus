import * as tmi from "tmi.js"
import * as utils from "./utils.js"
import * as twitchApi from "./twitchAPI.js"
import * as commandFns from "./commandFns.js"

import cmds from "../config/commands.json" with { type: "json" }

/**
 * The Icarus Class
 */
export class Icarus {

    public twitch: twitchApi.TwitchAPI;
    private readonly tmiClient: tmi.Client;

    /**
     * Constructor; initializes the TwitchAPI object and tmi.js client.
     */
    constructor () {
        this.twitch = new twitchApi.TwitchAPI()
        this.tmiClient = tmi.client(this.twitch.getTmiConfig());
    }

    /**
     * Initialize the IRC Connection.
     */
    public async init () {
        this.tmiClient.on('message', this.onMessageHandler.bind(this))
        this.tmiClient.on('connected', this.onConnectedHandler.bind(this))
        return await utils.tmiConnect(this.tmiClient)
    }

    /**
     * Handler for incoming messages
     * @param target the channel target
     * @param contact information on the message and user
     * @param msg the message
     * @param self is message sender icarus
     * @private
     */
    private async onMessageHandler (target: string, contact: object, msg: string, self: boolean) {
        if (self) { return; }

        const uuid = contact["user-id" as keyof typeof contact]
        const id = contact["id" as keyof typeof contact]

        console.log(`twitch: ${this.twitch}`)

        const moderationResult = await utils.moderate(msg, id, uuid, this.twitch)

        if (!moderationResult.allowed && moderationResult.removed) {
            await this.tmiClient.say(target, `Hi, ${contact["username" as keyof typeof contact]}! Your message was removed as it violates chat rules.`)
        } else if (!moderationResult.allowed && !moderationResult.removed) {
            console.error(`REMOVAL FAILURE: Message ${id} is not allowed, but could not be removed!!`)
        }

        if (msg[0] === "!") {

            const input = msg.split(" ");
            const commandName = input[0];
            const args = input.slice(1)

            if (this.isValidTextCommand(commandName, cmds.text)) {
                await this.tmiClient.say(target, cmds.text[commandName]);
            } else if (this.isValidFunctionCommand(commandName, cmds.functions)) {
                const functionName = cmds.functions[commandName as keyof typeof cmds.functions];
                if (this.isAvailableFunction(functionName, commandFns)) {
                    await this.tmiClient.say(target, commandFns[functionName](args));
                }
            }

        }

    }

    /**
     * Handler for IRC connection
     * @param addr Connected server address
     * @param port Connected server port
     * @private
     */
    private onConnectedHandler (addr: string, port: Number) {
        console.log(`* Connected to ${addr}:${port}`);
    }

    /**
     * Checks if a command is a valid text-returning command
     * @param command the command to check
     * @param commands the commands to check from
     * @private
     */
    private isValidTextCommand (command: string, commands: typeof cmds.text): command is keyof typeof cmds.text {
        return command in commands
    }

    /**
     * Checks if a command is a valid function-calling command
     * @param command the command to check
     * @param commands the commands to check from
     * @private
     */
    private isValidFunctionCommand (command: string, commands: typeof cmds.functions): command is keyof typeof cmds.functions {
        return command in commands
    }

    /**
     * Checks if a command-associated function name has been implemented in commandFns.ts
     * @param functionName the function name to check
     * @param functions the functions to check from
     * @private
     */
    private isAvailableFunction(functionName: string, functions: typeof commandFns): functionName is keyof typeof commandFns {
        return typeof functions[functionName as keyof typeof functions] === "function"
    }

}

