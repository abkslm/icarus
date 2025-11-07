import OpenAI from 'openai'
import config from "../config/config.json" with { type: "json" }

const apiKey = config["OpenAI"]["apiKey"]

const openai = new OpenAI({
    apiKey: apiKey,
})

/**
 * Sends a message to OpenAI GPT-4o to determine whether a message should be allowed.
 * @param input The message/text to check.
 * @returns true if allowed, false if not.
 */
export async function moderate (input: string) : Promise<boolean> {
    const systemPrompt: string = 'You are a Twitch Channel moderation bot. ' +
        'Your only job is to determine whether a message is PERMITTED or NOT-PERMITTED. ' +
        'Messages which are offensive, contain self-promotion, or direct rude/hateful sentiments toward another person are NOT-PERMITTED. ' +
        'Messages which contain slurs or words similar to slurs are also NOT-PERMITTED. ' +
        'Messages which contain mental health terms that are not used in an educational or helpful context are NOT-PERMITTED. ' +
        'Messages which use simple swear words or express negativity toward the game or game play styles (for example, snipers, campers) are PERMITTED. ' +
        'Messages which contain greetings or questions are not meant for you and are PERMITTED. ' +
        'Only reply with PERMITTED OR NOT-PERMITTED.' +
        'Never include punctuation. ' +
        'Do not echo the input.'

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'user', content: input }, { role: 'assistant', content: systemPrompt }
        ]
    })

    const decision = response.choices[0].message.content as string
    if (decision.includes('NOT-PERMITTED')) {
        console.log("NOT-PERMITTED")
        return false
    } else {
        console.log("PERMITTED")
        return true
    }

}

/**
 * Tests moderation system prompt.
 * Please excuse all harmful terms written here, they are needed to verify that the system prompt catches them.
 */
async function testModeration () {
    const inputs: string[] = [
        // Removed. These were very profane.
    ]
    for (let input in inputs) {
        let decision = await moderate(inputs[input])
        console.log(`${decision}: ${inputs[input]}`)
    }
}

