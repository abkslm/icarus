export function echo (args) {
    if (args.length > 0) {
        return args.join(" ")
    } else {
        return "An argument was not provided! Usage: \"!echo hello world\""
    }
}

