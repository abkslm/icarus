import Anthropic from '@anthropic-ai/sdk';

import config from "../config/config.json" with { type: "json" }

const anthropic = new Anthropic({
    apiKey: config["Claude"]["apiKey"]
});
