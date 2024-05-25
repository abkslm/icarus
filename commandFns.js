export function echo (args) {
    if (args.length > 0) {
        return args.join(" ")
    } else {
        return "An argument was not provided! Usage: \"!echo hello world\""
    }
}

export function about () {
    return "Hi! I'm Icarus, a chatbot built by @pr3sidia.\n" +
        "I'm capable of simple and advanced programmatic commands.\n" +
        "Run `!help` to see what I can do!"
}

export function claude (args) {

}

export function gpt (args) {

}

