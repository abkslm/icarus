
export function echo (args: string[]): string {
    if (args.length > 0) {
        return args.join(" ")
    } else {
        return "An argument was not provided! Usage: \"!echo hello world\""
    }
}

export function about (): string {
    return "Hi! I'm Icarus, a chatbot built by @pr3sidia.\n" +
        "I'm capable of simple and advanced programmatic commands.\n" +
        "Run `!help` to see what I can do!"
}


export function minecraftWhitelistAdd (args: string[]): string {
    // https://github.com/servertap-io/servertap
    return args.join(" ")
}

export function gpt (args: string[]): string {
    return "Not yet implemented, please try again later!"
}

export function claude (args: string[]): string {
    return "Not yet implemented, please try again later!"
}

