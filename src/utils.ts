import * as openaiConnector from "./openaiConnector.js"
import * as twitchApi from "./twitchAPI.js"
import * as tmi from "tmi.js"

/**
 * Moderate a given message, remove if violates system prompt described in openaiConnector.moderate()
 * @param message The message to moderate
 * @param id The message's ID
 * @param uuid The sender's ID
 * @param twitch the TwitchAPI object
 * @returns An object containing {allowed: boolean, removed: boolean}
 */
export async function moderate (message: string, id: string, uuid: string, twitch: twitchApi.TwitchAPI) {
    let allowed: boolean;
    let removed: boolean;

    if (message.length > 1024) {
        allowed = false
    } else {
        allowed = await openaiConnector.moderate(message)
    }

    if (!allowed) {
        removed = await twitch.removeMessage(id)
    } else {
        removed = false;
    }

    return {
        "allowed": allowed,
        "removed": removed,
    }

}

/**
 * Connect the tmi client
 * Calls tmiConnectRec recursively to enable retries
 * @param client the tmi.Client to connect
 */
export async function tmiConnect (client: tmi.Client) {
    return await tmiConnectRec(client, 0)
}

/**
 * Connect the tmi client
 * Calls self recursively to enable retries
 * @param client the tmi.Client to connect
 * @param depth the current depth
 */
async function tmiConnectRec (client: tmi.Client, depth: number) {
    if (depth < 3) {
        try {
            await client.connect()
            return true
        } catch (err) {
            console.error(err)
            return await tmiConnectRec(client, depth + 1)
        }
    } else {
        console.error("tmi failed to connect after 3 attempts. Exiting...")
        process.exit(-1)
    }
}