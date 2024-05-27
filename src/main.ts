import * as Icarus from "./icarus.js"

const icarus: Icarus.Icarus = new Icarus.Icarus()

icarus.init().then(r => {
    r ? console.log("IRC Connected, icarus initialized") : console.log("IRC Failed to Connect, icarus initialized")
})


