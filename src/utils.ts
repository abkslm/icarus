import * as openaiConnector from "./openaiConnector.js"
import * as twitchApi from "./twitchAPI.js"
import * as tmi from "tmi.js"

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

export async function tmiConnect (client: tmi.Client) {
    return await tmiConnectRec(client, 0)
}

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