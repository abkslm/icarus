import * as openaiConnector from "./openaiConnector.js"
import * as twitchApi from "./twitchAPI.js"

export async function moderate (message: string, id: string, uuid: string, twitch: twitchApi.TwitchAPI) {
    const allowed = await openaiConnector.moderate(message)
    console.log(`utilities decision: ${allowed}`)

    if (!allowed) {
        await twitch.removeMessage(id)
    }

    return allowed
}
