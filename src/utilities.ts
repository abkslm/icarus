import * as openaiConnector from "./openaiConnector.js"

export async function moderate (message: string) {
    const decision = await openaiConnector.moderate(message)
    console.log(`utilities decision: ${decision}`)
    return decision
}
