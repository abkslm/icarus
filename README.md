# icarus
A Twitch Chatbot, capable of advanced programmatic commands. 

## About
icarus was created due to my massive frustration with current chatbots on the market--there is not a single quality bot that allows for programmatic commands, which makes for a suboptimal experience.

Some cases where icarus excels are:
- Error checking: n of parameters, parameter validity, etc.
- Conditionals: Primarily in parameter validation
- External Access (WIP): This is a *big* one, allows use of external services via APIs;
  - Execute commands on a Minecraft Java Server (i.e. /whitelist, /spawnentity, etc.)
  - Control music streaming
  - "Crowd Control"-like functionality
- Sentiment-based AI Moderation
  - icarus uses OpenAI's GPT-4o to analyze sentiment of messages and determine whether they should be permitted.
  - This allows users to send messages like "I hate snipers", but blocks messages like "I hate you (or X group)."
